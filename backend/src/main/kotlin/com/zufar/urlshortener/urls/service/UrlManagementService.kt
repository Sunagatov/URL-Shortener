package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import com.zufar.urlshortener.shared.config.RateLimitConfig
import com.zufar.urlshortener.shared.config.RateLimitProperties
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.logging.LogSanitizer
import com.zufar.urlshortener.shared.security.AuditLogService
import com.zufar.urlshortener.shared.security.PrivacyHasher
import com.zufar.urlshortener.urls.config.UrlProtectionProperties
import com.zufar.urlshortener.urls.dto.ShortenUrlRequest
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.dto.UrlMappingPageDto
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.dao.DuplicateKeyException
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.net.URI
import java.time.Clock
import java.time.Instant
import java.time.temporal.ChronoUnit

private const val ACCESS_URL_MAPPING_DENIED_MESSAGE = "You are not allowed to access this URL mapping"
private const val DELETE_URL_MAPPING_DENIED_MESSAGE = "You are not allowed to delete this URL mapping"
private const val INVALID_URL_REQUEST_CODE = "INVALID_URL_REQUEST"

@Service
class UrlManagementService(
    private val urlRepository: UrlRepository,
    private val urlValidator: UrlValidator,
    private val authenticatedUserContext: AuthenticatedUserContextService,
    private val urlMappingAccessService: UrlMappingAccessService,
    private val clientIpResolver: ClientIpResolver = ClientIpResolver(RateLimitConfig(RateLimitProperties())),
    private val protectionProperties: UrlProtectionProperties = UrlProtectionProperties(),
    private val auditLogService: AuditLogService = AuditLogService(),
    @Value($$"${app.base-url}") private val baseUrl: String,
    @Value($$"${app.urls.expiration.default-days:365}") private val defaultExpirationDays: Long,
    @Value($$"${app.urls.short-code.max-generation-attempts:10}") private val maxCodeGenerationAttempts: Int,
    @Value($$"${app.urls.pagination.max-size:100}") private val maxPageSize: Int,
    private val clock: Clock
) {
    private val log = LoggerFactory.getLogger(UrlManagementService::class.java)

    fun shorten(request: ShortenUrlRequest, httpRequest: HttpServletRequest): String {
        val normalizedRequest = normalize(request)
        val normalizedBaseUrl = baseUrl.trimEnd('/')

        urlValidator.validateUrl(normalizedRequest.originalUrl)
        val customAlias = normalizedRequest.customAlias?.trim()
        if (customAlias != null) {
            validateCustomAlias(customAlias)
        }
        val now = Instant.now(clock)
        val userId = authenticatedUserContext.findAuthenticatedUserIdOrNull()
        val clientIp = clientIpResolver.resolve(httpRequest)
        val creatorKey = creatorKey(userId, clientIp)
        enforceDailyQuota(creatorKey, userId, now)

        if (customAlias != null) {
            val shortUrl = "$normalizedBaseUrl/$customAlias"
            try {
                urlRepository.insert(
                    buildUrlMapping(normalizedRequest, httpRequest, customAlias, shortUrl, userId, clientIp, creatorKey, now)
                )
                logCreation(customAlias, normalizedRequest, userId)
                return shortUrl
            } catch (_: DuplicateKeyException) {
                throw ApplicationException.conflict("ALIAS_TAKEN", "Custom alias '$customAlias' is already in use")
            }
        }

        repeat(maxCodeGenerationAttempts) { attempt ->
            val urlHash = StringEncoder.generate()
            val shortUrl = "$normalizedBaseUrl/$urlHash"

            try {
                urlRepository.insert(
                    buildUrlMapping(
                        request = normalizedRequest,
                        httpRequest = httpRequest,
                        urlHash = urlHash,
                        shortUrl = shortUrl,
                        userId = userId,
                        clientIp = clientIp,
                        creatorKey = creatorKey,
                        now = now
                    )
                )
                logCreation(urlHash, normalizedRequest, userId)
                return shortUrl
            } catch (_: DuplicateKeyException) {
                log.debug("short_url_collision_detected urlHash={} attempt={}", urlHash, attempt + 1)
            }
        }

        throw IllegalStateException("Failed to generate a unique short code after $maxCodeGenerationAttempts attempts")
    }

    fun getPublicUrlMapping(urlHash: String): UrlMappingDto =
        UrlMappingDto.fromEntity(urlMappingAccessService.getActiveUrlMapping(urlHash))

    fun getOwnedUrlMapping(urlHash: String): UrlMappingDto =
        UrlMappingDto.fromEntity(urlMappingAccessService.getOwnedActiveUrlMapping(urlHash, ACCESS_URL_MAPPING_DENIED_MESSAGE))

    fun getUserUrlMappings(page: Int, size: Int): UrlMappingPageDto {
        validatePageRequest(page, size)

        val pageable = PageRequest.of(page, size)
        val userId = authenticatedUserContext.requireAuthenticatedUserId()
        val now = Instant.now(clock)
        val mappingsPage = urlRepository.findAllByUserIdAndExpirationDateAfter(userId, now, pageable)

        return UrlMappingPageDto(
            content = mappingsPage.content.map(UrlMappingDto::fromEntity),
            page = mappingsPage.number,
            size = mappingsPage.size,
            totalElements = mappingsPage.totalElements,
            totalPages = mappingsPage.totalPages
        )
    }

    fun updateOriginalUrl(urlHash: String, newOriginalUrl: String): UrlMappingDto {
        val trimmedUrl = newOriginalUrl.trim()
        urlValidator.validateUrl(trimmedUrl)
        val urlMapping = urlMappingAccessService.getOwnedActiveUrlMapping(urlHash, ACCESS_URL_MAPPING_DENIED_MESSAGE)
        val updated = urlRepository.save(urlMapping.copy(originalUrl = trimmedUrl))
        urlMappingAccessService.evictUrlMapping(urlHash)
        log.info("short_url_updated urlHash={} targetHost={}", urlHash, LogSanitizer.safeUrlHost(trimmedUrl))
        auditLogService.record("short_url_updated", "success", urlMapping.userId, urlHash, trimmedUrl)
        return UrlMappingDto.fromEntity(updated)
    }

    fun delete(urlHash: String) {
        val urlMapping = urlMappingAccessService.deleteOwnedActiveUrlMapping(urlHash, DELETE_URL_MAPPING_DENIED_MESSAGE)
        log.info(
            "short_url_deleted urlHash={} ownerUserId={} targetHost={}",
            urlHash,
            urlMapping.userId ?: "unknown",
            LogSanitizer.safeUrlHost(urlMapping.originalUrl)
        )
        auditLogService.record("short_url_deleted", "success", urlMapping.userId, urlHash, urlMapping.originalUrl)
    }

    fun getActiveUrlMapping(urlHash: String): UrlMapping =
        urlMappingAccessService.getActiveUrlMapping(urlHash)

    fun getOwnedActiveUrlMapping(urlHash: String, accessDeniedMessage: String): UrlMapping =
        urlMappingAccessService.getOwnedActiveUrlMapping(urlHash, accessDeniedMessage)

    private fun buildUrlMapping(
        request: ShortenUrlRequest,
        httpRequest: HttpServletRequest,
        urlHash: String,
        shortUrl: String,
        userId: String?,
        clientIp: String,
        creatorKey: String,
        now: Instant
    ): UrlMapping {
        val userAgent = httpRequest.getHeader("User-Agent")
        val interstitial = safetyInterstitial(request.originalUrl, userId)
        val mapping = UrlMapping(
            urlHash = urlHash,
            shortUrl = shortUrl,
            originalUrl = request.originalUrl,
            clickCount = 0,
            createdAt = now,
            expirationDate = now.plus(request.daysCount ?: defaultExpirationDays, ChronoUnit.DAYS),
            requestIp = null,
            userAgent = null,
            requestIpHash = PrivacyHasher.sha256(clientIp),
            userAgentHash = PrivacyHasher.sha256(userAgent),
            creatorKey = creatorKey,
            userId = userId,
            safetyInterstitialRequired = interstitial.required,
            safetyInterstitialReason = interstitial.reason
        )

        return mapping
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

    private fun validatePageRequest(page: Int, size: Int) {
        if (page < 0) {
            throw ApplicationException.badRequest(INVALID_URL_REQUEST_CODE, "Page must be greater than or equal to 0")
        }
        if (size !in 1..maxPageSize) {
            throw ApplicationException.badRequest(INVALID_URL_REQUEST_CODE, "Size must be between 1 and $maxPageSize")
        }
    }

    private fun logCreation(urlHash: String, request: ShortenUrlRequest, userId: String?) {
        log.info(
            "short_url_created urlHash={} ownerUserId={} targetHost={} expiresInDays={} custom={}",
            urlHash,
            userId ?: "anonymous",
            LogSanitizer.safeUrlHost(request.originalUrl),
            request.daysCount ?: defaultExpirationDays,
            request.customAlias != null
        )
        auditLogService.record(
            "short_url_created",
            "success",
            userId,
            urlHash,
            request.originalUrl
        )
    }

    private fun validateCustomAlias(alias: String) {
        if (!alias.matches(Regex("^[a-zA-Z0-9_-]+$"))) {
            throw ApplicationException.badRequest(INVALID_URL_REQUEST_CODE, "Custom alias can only contain letters, numbers, hyphens, and underscores")
        }
        if (alias.lowercase() in RESERVED_ALIASES) {
            throw ApplicationException.conflict("ALIAS_RESERVED", "This alias is reserved and cannot be used")
        }
    }

    companion object {
        private val RESERVED_ALIASES = setOf(
            "signin", "signup", "login", "logout", "register",
            "account", "auth", "dashboard", "settings", "profile", "security",
            "analytics", "admin", "api", "health", "docs",
            "about", "terms", "privacy", "contact", "help", "support",
            "favicon.ico", "robots.txt", "sitemap.xml"
        )
    }

    private fun normalize(request: ShortenUrlRequest): ShortenUrlRequest {
        val trimmedOriginalUrl = request.originalUrl.trim()
        return if (trimmedOriginalUrl == request.originalUrl) {
            request
        } else {
            request.copy(originalUrl = trimmedOriginalUrl)
        }
    }

    private fun creatorKey(userId: String?, clientIp: String): String =
        userId?.let { "user:$it" } ?: "ip:${PrivacyHasher.sha256(clientIp) ?: "unknown"}"

    private fun safetyInterstitial(originalUrl: String, userId: String?): SafetyInterstitial {
        val host = runCatching { URI(originalUrl).host.orEmpty() }.getOrDefault("")
        if (protectionProperties.safetyInterstitialForIpDestinations && host.isIpLiteral()) {
            return SafetyInterstitial(true, "ip_destination")
        }
        if (protectionProperties.safetyInterstitialForAnonymous && userId == null) {
            return SafetyInterstitial(true, "anonymous_creator")
        }
        return SafetyInterstitial(false, null)
    }

    private fun String.isIpLiteral(): Boolean =
        matches(Regex("^\\d{1,3}(\\.\\d{1,3}){3}$")) || contains(":")

    private data class SafetyInterstitial(val required: Boolean, val reason: String?)
}
