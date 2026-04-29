package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.CurrentUserProvider
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.exception.UrlNotFoundException
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class UrlMappingProvider(
    private val urlRepository: UrlRepository,
    private val currentUserProvider: CurrentUserProvider
) {

    fun getPublicUrlMappingByHash(urlHash: String): UrlMappingDto {
        return UrlMappingDto.fromEntity(getActiveUrlMapping(urlHash))
    }

    fun getOwnedUrlMappingByHash(urlHash: String): UrlMappingDto {
        val urlMapping = getActiveUrlMapping(urlHash)
        val currentUserId = currentUserProvider.requireCurrentUserId()

        if (urlMapping.userId == null || urlMapping.userId != currentUserId) {
            throw AccessDeniedException("You are not allowed to access this URL mapping")
        }

        return UrlMappingDto.fromEntity(urlMapping)
    }

    private fun getActiveUrlMapping(urlHash: String): UrlMapping {
        val now = LocalDateTime.now()

        return urlRepository.findByUrlHash(urlHash)
            .filter { it.expirationDate.isAfter(now) }
            .orElseThrow { UrlNotFoundException("URL mapping not found") }
    }
}
