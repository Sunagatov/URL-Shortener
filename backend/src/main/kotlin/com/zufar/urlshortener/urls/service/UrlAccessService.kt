package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.user.CurrentUserService
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.exception.UrlNotFoundException
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

private const val URL_MAPPING_NOT_FOUND_MESSAGE = "URL mapping not found"

@Service
class UrlAccessService(
    private val cachedUrlMappingLookupService: CachedUrlMappingLookupService,
    private val currentUserService: CurrentUserService,
    private val clock: Clock
) {

    fun getActiveUrlMapping(urlHash: String): UrlMapping {
        val now = LocalDateTime.now(clock)

        return cachedUrlMappingLookupService.getByUrlHash(urlHash)
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
}
