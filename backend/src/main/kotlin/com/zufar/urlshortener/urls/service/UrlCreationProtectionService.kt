package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.analytics.entity.BotCategory
import com.zufar.urlshortener.analytics.service.BotDetectionService
import com.zufar.urlshortener.analytics.service.UserAgentParserService
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
    private val auditLogService: AuditLogService,
    private val userAgentParser: UserAgentParserService,
    private val botDetectionService: BotDetectionService,
    private val creationBurstGuard: CreationBurstGuard
) {
    fun prepareCreation(
        originalUrl: String,
        userId: String?,
        request: HttpServletRequest,
        now: Instant
    ): UrlCreationProtection {
        val clientIp = clientIpResolver.resolve(request)
        val creatorKey = creatorKey(userId, clientIp)
        val userAgent = request.getHeader("User-Agent")
        enforceDailyQuota(creatorKey, userId, now)
        enforceDestinationHostQuota(originalUrl, now)

        val interstitial = classifySafetyInterstitial(originalUrl, userId)
        val risk = assessCreationRisk(creatorKey, userAgent, now, interstitial)
        if (risk.score >= protectionProperties.creationRiskBlockThreshold) {
            auditLogService.record(
                "short_url_creation_blocked_by_risk",
                "blocked",
                userId,
                reason = risk.reasons.joinToString(",")
            )
            throw ApplicationException.tooManyRequests(
                "URL_CREATION_RISK_TOO_HIGH",
                "URL creation temporarily blocked due to elevated abuse risk",
                retryAfterSeconds = protectionProperties.rapidCreationBurstWindowSeconds
            )
        }

        return UrlCreationProtection(
            clientIp = clientIp,
            creatorKey = creatorKey,
            safetyInterstitialRequired = risk.interstitialRequired,
            safetyInterstitialReason = risk.interstitialReason,
            creationRiskScore = risk.score,
            creationRiskReasons = risk.reasons,
            creationBotCategory = risk.botCategory,
            recentCreationCount = risk.recentCreationCount
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

    private fun assessCreationRisk(
        creatorKey: String,
        userAgent: String?,
        now: Instant,
        interstitial: UrlSafetyInterstitial
    ): CreationRiskAssessment {
        val reasons = linkedSetOf<String>()
        var score = 0

        val botInfo = botDetectionService.detect(userAgent, userAgentParser.parse(userAgent).deviceType)
        val highRiskAutomation = isHighRiskCreationAutomation(userAgent, botInfo.category)
        if (highRiskAutomation) {
            reasons += "automation_user_agent"
            score += 40
        }

        val recentCreationCount = creationBurstGuard.recordAndCount(
            creatorKey,
            now,
            protectionProperties.rapidCreationBurstWindowSeconds
        )
        if (recentCreationCount >= protectionProperties.rapidCreationBurstThreshold) {
            reasons += "rapid_creation_burst"
            score += 35
        }

        when (interstitial.reason) {
            "ip_destination" -> {
                reasons += "ip_destination"
                score += 30
            }
            "http_destination" -> {
                reasons += "http_destination"
                score += 20
            }
            "suspicious_destination" -> {
                reasons += "suspicious_destination"
                score += 25
            }
            "anonymous_creator" -> {
                reasons += "anonymous_creator"
                score += 15
            }
        }

        val automationInterstitial = protectionProperties.safetyInterstitialForAutomation && highRiskAutomation
        val burstInterstitial = recentCreationCount >= protectionProperties.rapidCreationBurstThreshold
        val interstitialReason = when {
            interstitial.reason != null -> interstitial.reason
            automationInterstitial -> "automation_detected"
            burstInterstitial -> "rapid_creation_burst"
            else -> null
        }

        return CreationRiskAssessment(
            score = score,
            reasons = reasons.toList(),
            botCategory = if (highRiskAutomation) botInfo.category ?: BotCategory.UNKNOWN_BOT else null,
            recentCreationCount = recentCreationCount,
            interstitialRequired = interstitial.required || automationInterstitial || burstInterstitial,
            interstitialReason = interstitialReason
        )
    }

    private fun isHighRiskCreationAutomation(userAgent: String?, botCategory: BotCategory?): Boolean {
        if (userAgent.isNullOrBlank()) return botCategory == BotCategory.UNKNOWN_BOT

        val ua = userAgent.lowercase()
        if (HIGH_RISK_AUTOMATION_MARKERS.any { ua.contains(it) }) {
            return true
        }

        return when (botCategory) {
            BotCategory.SEARCH_CRAWLER,
            BotCategory.SOCIAL_PREVIEW,
            BotCategory.UPTIME_MONITOR,
            BotCategory.UNKNOWN_BOT -> true
            BotCategory.GENERIC_AUTOMATION,
            null -> false
        }
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
        private val HIGH_RISK_AUTOMATION_MARKERS = setOf(
            "headlesschrome", "phantomjs", "selenium", "puppeteer", "playwright", "scrapy", "mechanize"
        )
    }
}

data class UrlSafetyInterstitial(val required: Boolean, val reason: String?)

data class UrlCreationProtection(
    val clientIp: String,
    val creatorKey: String,
    val safetyInterstitialRequired: Boolean,
    val safetyInterstitialReason: String?,
    val creationRiskScore: Int,
    val creationRiskReasons: List<String>,
    val creationBotCategory: BotCategory?,
    val recentCreationCount: Long
)

data class CreationRiskAssessment(
    val score: Int,
    val reasons: List<String>,
    val botCategory: BotCategory?,
    val recentCreationCount: Long,
    val interstitialRequired: Boolean,
    val interstitialReason: String?
)
