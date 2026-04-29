package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.CurrentUserProvider
import com.zufar.urlshortener.urls.exception.UrlNotFoundException
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.slf4j.LoggerFactory
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service

@Service
class UrlDeleter(
    private val urlRepository: UrlRepository,
    private val currentUserProvider: CurrentUserProvider
) {
    private val log = LoggerFactory.getLogger(UrlDeleter::class.java)

    fun deleteUrl(urlHash: String) {
        val urlMapping = urlRepository.findByUrlHash(urlHash)
            .orElseThrow {
                log.warn("URL mapping not found for urlHash='{}'", urlHash)
                UrlNotFoundException("No URL mapping found for urlHash='$urlHash'")
            }

        val currentUserId = currentUserProvider.requireCurrentUserId()
        if (urlMapping.userId == null || urlMapping.userId != currentUserId) {
            throw AccessDeniedException("You are not allowed to delete this URL mapping")
        }

        urlRepository.deleteById(urlMapping.urlHash)
        log.info("Deleted URL mapping for urlHash='{}'", urlHash)
    }
}
