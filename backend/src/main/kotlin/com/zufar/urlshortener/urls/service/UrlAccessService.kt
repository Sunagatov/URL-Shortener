package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.CurrentUserProvider
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.exception.UrlNotFoundException
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

private const val URL_MAPPING_NOT_FOUND_MESSAGE = "URL mapping not found"

@Service
class UrlAccessService(
    private val urlRepository: UrlRepository,
    private val currentUserProvider: CurrentUserProvider,
    private val clock: Clock
) {

    fun getActiveUrlMapping(urlHash: String): UrlMapping {
        val now = LocalDateTime.now(clock)

        return urlRepository.findByUrlHash(urlHash)
            .filter { it.expirationDate.isAfter(now) }
            .orElseThrow { UrlNotFoundException(URL_MAPPING_NOT_FOUND_MESSAGE) }
    }

    fun getOwnedActiveUrlMapping(urlHash: String, accessDeniedMessage: String): UrlMapping {
        val urlMapping = getActiveUrlMapping(urlHash)
        val currentUserId = currentUserProvider.requireCurrentUserId()

        if (urlMapping.userId == null || urlMapping.userId != currentUserId) {
            throw AccessDeniedException(accessDeniedMessage)
        }

        return urlMapping
    }
}
