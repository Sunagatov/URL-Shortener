package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.user.CurrentUserService
import com.zufar.urlshortener.shared.URL_MAPPINGS_CACHE
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.urls.dto.ShortenUrlRequest
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.dto.UrlMappingPageDto
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.exception.UrlNotFoundException
import com.zufar.urlshortener.urls.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.DuplicateKeyException
import org.springframework.data.domain.PageRequest
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

private const val MIN_ALLOWED_DAYS_COUNT = 1L
private const val URL_MAPPING_NOT_FOUND_MESSAGE = "URL mapping not found"
private const val ACCESS_URL_MAPPING_DENIED_MESSAGE = "You are not allowed to access this URL mapping"
private const val DELETE_URL_MAPPING_DENIED_MESSAGE = "You are not allowed to delete this URL mapping"

@Service
class UrlManagementService(
    private val urlRepository: UrlRepository,
    private val urlValidator: UrlValidator,
    private val currentUserService: CurrentUserService,
    private val mongoTemplate: MongoTemplate,
    @Value("\${app.base-url}") private val baseUrl: String,
    @Value("\${app.urls.expiration.default-days:365}") private val defaultExpirationDays: Long,
    @Value("\${app.urls.expiration.max-days:365}") private val maxAllowedDaysCount: Long,
    @Value("\${app.urls.short-code.max-generation-attempts:10}") private val maxCodeGenerationAttempts: Int,
    @Value("\${app.urls.pagination.max-size:100}") private val maxPageSize: Int,
    private val clock: Clock
) {
    private val log = LoggerFactory.getLogger(UrlManagementService::class.java)

    fun shorten(request: ShortenUrlRequest, httpRequest: HttpServletRequest): String {
        val normalizedRequest = normalize(request)
        val normalizedBaseUrl = baseUrl.trimEnd('/')

        log.info("url.create.requested: original_url={}, client_ip={}", normalizedRequest.originalUrl, httpRequest.remoteAddr)

        urlValidator.validateUrl(normalizedRequest.originalUrl)
        validateDaysCount(normalizedRequest.daysCount)

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
                log.info("url.created: url_hash={}, short_url={}, original_url={}", urlHash, shortUrl, normalizedRequest.originalUrl)
                return shortUrl
            } catch (_: DuplicateKeyException) {
                log.warn("url.short_code_collision: url_hash={}, attempt={}", urlHash, attempt + 1)
            }
        }

        throw IllegalStateException("Failed to generate a unique short code after $maxCodeGenerationAttempts attempts")
    }

    fun getPublicUrlMapping(urlHash: String): UrlMappingDto =
        UrlMappingDto.fromEntity(getActiveUrlMapping(urlHash))

    fun getOwnedUrlMapping(urlHash: String): UrlMappingDto =
        UrlMappingDto.fromEntity(getOwnedActiveUrlMapping(urlHash, ACCESS_URL_MAPPING_DENIED_MESSAGE))

    fun getUserUrlMappings(page: Int, size: Int): UrlMappingPageDto {
        validatePageRequest(page, size)

        val pageable = PageRequest.of(page, size)
        val userId = currentUserService.requireCurrentUserId()
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

    @CacheEvict(cacheNames = [URL_MAPPINGS_CACHE], key = "#urlHash")
    fun delete(urlHash: String) {
        val urlMapping = getOwnedActiveUrlMapping(urlHash, DELETE_URL_MAPPING_DENIED_MESSAGE)
        urlRepository.deleteById(urlMapping.urlHash)
        log.info("url.deleted: url_hash={}", urlHash)
    }

    fun incrementClickCount(urlHash: String) {
        val query = Query.query(Criteria.where("_id").`is`(urlHash))
        val update = Update().inc("clickCount", 1)
        mongoTemplate.updateFirst(query, update, UrlMapping::class.java)
    }

    @Cacheable(cacheNames = [URL_MAPPINGS_CACHE], key = "#urlHash")
    fun getCachedUrlMapping(urlHash: String): UrlMapping =
        urlRepository.findByUrlHash(urlHash)
            .orElseThrow { UrlNotFoundException(URL_MAPPING_NOT_FOUND_MESSAGE) }

    fun getActiveUrlMapping(urlHash: String): UrlMapping {
        val now = LocalDateTime.now(clock)

        return getCachedUrlMapping(urlHash)
            .takeIf { it.expirationDate.isAfter(now) }
            ?: throw UrlNotFoundException(URL_MAPPING_NOT_FOUND_MESSAGE)
    }

    fun getOwnedActiveUrlMapping(urlHash: String, accessDeniedMessage: String): UrlMapping {
        val urlMapping = getActiveUrlMapping(urlHash)
        val currentUserId = currentUserService.requireCurrentUserId()

        if (urlMapping.userId == null || urlMapping.userId != currentUserId) {
            throw AccessDeniedException(accessDeniedMessage)
        }

        return urlMapping
    }

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
            userId = currentUserService.getCurrentUserIdOrNull()
        )

        log.debug(
            "url.mapping_built: url_hash={}, short_url={}, original_url={}, created_at={}, expiration_date={}, request_ip={}, user_agent={}, user_id={}",
            urlHash,
            shortUrl,
            mapping.originalUrl,
            mapping.createdAt,
            mapping.expirationDate,
            mapping.requestIp,
            mapping.userAgent,
            mapping.userId
        )

        return mapping
    }

    private fun validatePageRequest(page: Int, size: Int) {
        if (page < 0) {
            throw InvalidRequestException("Page must be greater than or equal to 0")
        }
        if (size !in 1..maxPageSize) {
            throw InvalidRequestException("Size must be between 1 and $maxPageSize")
        }
    }

    private fun validateDaysCount(daysCount: Long?) {
        val value = daysCount ?: return
        if (value < MIN_ALLOWED_DAYS_COUNT) {
            throw InvalidRequestException("Days count must be at least $MIN_ALLOWED_DAYS_COUNT day(s).")
        }
        if (value > maxAllowedDaysCount) {
            throw InvalidRequestException("Days count must not exceed $maxAllowedDaysCount day(s).")
        }
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
