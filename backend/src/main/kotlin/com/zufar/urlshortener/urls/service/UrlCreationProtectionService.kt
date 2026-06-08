package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.security.AuditLogService
import com.zufar.urlshortener.shared.security.PrivacyHasher
import com.zufar.urlshortener.urls.config.UrlProtectionProperties
import com.zufar.urlshortener.urls.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Service
import java.net.URI
import java.time.Instant
import java.time.temporal.ChronoUnit

@Service
class UrlCreationProtectionService(
    private val urlRepository: UrlRepository,
    private val clientIpResolver: ClientIpResolver,
    private val protectionProperties: UrlProtectionProperties,
    private val auditLogService: AuditLogService
) {
    fun prepareCreation(
        originalUrl: String,
        userId: String?,
        request: HttpServletRequest,
        now: Instant
    ): UrlCreationProtection {
        val clientIp = clientIpResolver.resolve(request)
        val creatorKey = creatorKey(userId, clientIp)
        enforceDailyQuota(creatorKey, userId, now)
        enforceDestinationHostQuota(originalUrl, now)

        val interstitial = classifySafetyInterstitial(originalUrl, userId)
        return UrlCreationProtection(
            clientIp = clientIp,
            creatorKey = creatorKey,
            safetyInterstitialRequired = interstitial.required,
            safetyInterstitialReason = interstitial.reason
        )
    }

    private fun enforceDailyQuota(creatorKey: String, userId: String?, now: Instant) {
        val limit = if (userId == null) {
            protectionProperties.anonymousDailyQuota
        } else {
            protectionProperties.authenticatedDailyQuota
        }
        val count = urlRepository.countByCreatorKeyAndCreatedAtAfter(creatorKey, now.minus(1, ChronoUnit.DAYS))
        if (count >= limit) {
            auditLogService.record("short_url_create_quota_exceeded", "blocked", userId)
            throw ApplicationException.tooManyRequests(
                "URL_DAILY_QUOTA_EXCEEDED",
                "Daily URL creation quota exceeded",
                retryAfterSeconds = ChronoUnit.DAYS.duration.seconds
            )
        }
    }

    private fun creatorKey(userId: String?, clientIp: String): String =
        userId?.let { "user:$it" } ?: "ip:${PrivacyHasher.sha256(clientIp) ?: "unknown"}"

    fun targetHost(originalUrl: String): String? =
        runCatching { URI(originalUrl).host?.lowercase()?.trimEnd('.')?.takeIf(String::isNotBlank) }
            .getOrNull()

    fun classifySafetyInterstitial(originalUrl: String, userId: String?): UrlSafetyInterstitial {
        val uri = runCatching { URI(originalUrl) }.getOrNull()
        val host = uri?.host.orEmpty().lowercase().trimEnd('.')
        if (protectionProperties.safetyInterstitialForIpDestinations && host.isIpLiteral()) {
            return UrlSafetyInterstitial(true, "ip_destination")
        }
        if (protectionProperties.safetyInterstitialForHttpDestinations && uri?.scheme.equals("http", ignoreCase = true)) {
            return UrlSafetyInterstitial(true, "http_destination")
        }
        if (protectionProperties.safetyInterstitialForSuspiciousDestinations && host.isSuspiciousDestinationHost()) {
            return UrlSafetyInterstitial(true, "suspicious_destination")
        }
        if (protectionProperties.safetyInterstitialForAnonymous && userId == null) {
            return UrlSafetyInterstitial(true, "anonymous_creator")
        }
        return UrlSafetyInterstitial(false, null)
    }

    private fun enforceDestinationHostQuota(originalUrl: String, now: Instant) {
        val host = targetHost(originalUrl) ?: return
        val count = urlRepository.countByTargetHostAndCreatedAtAfter(host, now.minus(1, ChronoUnit.DAYS))
        if (count >= protectionProperties.destinationHostDailyQuota) {
            auditLogService.record("short_url_destination_quota_exceeded", "blocked", targetId = host)
            throw ApplicationException.tooManyRequests(
                "URL_DESTINATION_QUOTA_EXCEEDED",
                "Daily URL creation quota exceeded for this destination",
                retryAfterSeconds = ChronoUnit.DAYS.duration.seconds
            )
        }
    }

    private fun String.isIpLiteral(): Boolean =
        matches(Regex("^\\d{1,3}(\\.\\d{1,3}){3}$")) || contains(":")

    private fun String.isSuspiciousDestinationHost(): Boolean {
        if (isBlank() || isIpLiteral()) {
            return false
        }

        val labels = split(".")
        val tld = labels.lastOrNull().orEmpty()
        return contains("xn--") ||
            labels.size > 4 ||
            length > 80 ||
            tld in HIGH_RISK_TLDS
    }

    companion object {
        private val HIGH_RISK_TLDS = setOf("zip", "mov")
    }
}

data class UrlSafetyInterstitial(val required: Boolean, val reason: String?)

data class UrlCreationProtection(
    val clientIp: String,
    val creatorKey: String,
    val safetyInterstitialRequired: Boolean,
    val safetyInterstitialReason: String?
)
