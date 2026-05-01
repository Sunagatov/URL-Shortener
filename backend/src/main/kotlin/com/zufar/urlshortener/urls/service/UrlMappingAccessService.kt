package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.urls.config.URL_MAPPINGS_CACHE
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

private const val URL_MAPPING_NOT_FOUND_MESSAGE = "URL mapping not found"
private const val URL_NOT_FOUND_CODE = "URL_NOT_FOUND"

@Service
class UrlMappingAccessService(
    private val urlRepository: UrlRepository,
    private val authenticatedUserContext: AuthenticatedUserContextService,
    private val mongoTemplate: MongoTemplate,
    private val clock: Clock
) {

    fun getActiveUrlMapping(urlHash: String): UrlMapping {
        val now = LocalDateTime.now(clock)

        return getCachedUrlMapping(urlHash)
            .takeIf { it.expirationDate.isAfter(now) }
            ?: throw ApplicationException.notFound(URL_NOT_FOUND_CODE, URL_MAPPING_NOT_FOUND_MESSAGE)
    }

    fun getOwnedActiveUrlMapping(urlHash: String, accessDeniedMessage: String): UrlMapping {
        val urlMapping = getActiveUrlMapping(urlHash)
        val currentUserId = authenticatedUserContext.requireAuthenticatedUserId()

        if (urlMapping.userId == null || urlMapping.userId != currentUserId) {
            throw AccessDeniedException(accessDeniedMessage)
        }

        return urlMapping
    }

    @CacheEvict(cacheNames = [URL_MAPPINGS_CACHE], key = "#urlHash")
    fun deleteOwnedActiveUrlMapping(urlHash: String, accessDeniedMessage: String): UrlMapping {
        val urlMapping = getOwnedActiveUrlMapping(urlHash, accessDeniedMessage)
        urlRepository.deleteById(urlMapping.urlHash)
        return urlMapping
    }

    fun incrementClickCount(urlHash: String) {
        val query = Query.query(Criteria.where("_id").`is`(urlHash))
        val update = Update().inc("clickCount", 1)
        mongoTemplate.updateFirst(query, update, UrlMapping::class.java)
    }

    @Cacheable(cacheNames = [URL_MAPPINGS_CACHE], key = "#urlHash")
    fun getCachedUrlMapping(urlHash: String): UrlMapping =
        urlRepository.findByUrlHash(urlHash)
            .orElseThrow { ApplicationException.notFound(URL_NOT_FOUND_CODE, URL_MAPPING_NOT_FOUND_MESSAGE) }
}
