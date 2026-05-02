package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.logging.LogSanitizer
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
import java.time.Clock
import java.time.LocalDateTime

private const val ACCESS_URL_MAPPING_DENIED_MESSAGE = "You are not allowed to access this URL mapping"
private const val DELETE_URL_MAPPING_DENIED_MESSAGE = "You are not allowed to delete this URL mapping"
private const val INVALID_URL_REQUEST_CODE = "INVALID_URL_REQUEST"

@Service
class UrlManagementService(
    private val urlRepository: UrlRepository,
    private val urlValidator: UrlValidator,
    private val authenticatedUserContext: AuthenticatedUserContextService,
    private val urlMappingAccessService: UrlMappingAccessService,
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
            val shortUrl = "$normalizedBaseUrl/$customAlias"
            try {
                urlRepository.insert(
                    buildUrlMapping(normalizedRequest, httpRequest, customAlias, shortUrl)
                )
                logCreation(customAlias, normalizedRequest)
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
                        shortUrl = shortUrl
                    )
                )
                logCreation(urlHash, normalizedRequest)
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
        val now = LocalDateTime.now(clock)
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
    }

    fun getActiveUrlMapping(urlHash: String): UrlMapping =
        urlMappingAccessService.getActiveUrlMapping(urlHash)

    fun getOwnedActiveUrlMapping(urlHash: String, accessDeniedMessage: String): UrlMapping =
        urlMappingAccessService.getOwnedActiveUrlMapping(urlHash, accessDeniedMessage)

    private fun buildUrlMapping(
        request: ShortenUrlRequest,
        httpRequest: HttpServletRequest,
        urlHash: String,
        shortUrl: String
    ): UrlMapping {
        val now = LocalDateTime.now(clock)
        val mapping = UrlMapping(
            urlHash = urlHash,
            shortUrl = shortUrl,
            originalUrl = request.originalUrl,
            clickCount = 0,
            createdAt = now,
            expirationDate = now.plusDays(request.daysCount ?: defaultExpirationDays),
            requestIp = httpRequest.remoteAddr,
            userAgent = httpRequest.getHeader("User-Agent"),
            userId = authenticatedUserContext.findAuthenticatedUserIdOrNull()
        )

        return mapping
    }

    private fun validatePageRequest(page: Int, size: Int) {
        if (page < 0) {
            throw ApplicationException.badRequest(INVALID_URL_REQUEST_CODE, "Page must be greater than or equal to 0")
        }
        if (size !in 1..maxPageSize) {
            throw ApplicationException.badRequest(INVALID_URL_REQUEST_CODE, "Size must be between 1 and $maxPageSize")
        }
    }

    private fun logCreation(urlHash: String, request: ShortenUrlRequest) {
        log.info(
            "short_url_created urlHash={} ownerUserId={} targetHost={} expiresInDays={} custom={}",
            urlHash,
            authenticatedUserContext.findAuthenticatedUserIdOrNull() ?: "anonymous",
            LogSanitizer.safeUrlHost(request.originalUrl),
            request.daysCount ?: defaultExpirationDays,
            request.customAlias != null
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
}
