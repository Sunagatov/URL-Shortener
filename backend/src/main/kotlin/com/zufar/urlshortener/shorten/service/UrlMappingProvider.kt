package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.EmailNormalizer
import com.zufar.urlshortener.shorten.dto.UrlMappingDto
import com.zufar.urlshortener.shorten.entity.UrlMapping
import com.zufar.urlshortener.shorten.exception.UrlNotFoundException
import com.zufar.urlshortener.shorten.repository.UrlRepository
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class UrlMappingProvider(
    private val urlRepository: UrlRepository,
    private val userRepository: UserRepository
) {

    fun getPublicUrlMappingByHash(urlHash: String): UrlMappingDto {
        return UrlMappingDto.fromEntity(getActiveUrlMapping(urlHash))
    }

    fun getOwnedUrlMappingByHash(urlHash: String): UrlMappingDto {
        val urlMapping = getActiveUrlMapping(urlHash)
        val currentUserId = getCurrentUserId()

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

    private fun getCurrentUserId(): String {
        val authentication = SecurityContextHolder.getContext().authentication
            ?: throw IllegalStateException("User is not authenticated")

        val email = authentication.name
        if (email.isBlank() || email == "anonymousUser") {
            throw IllegalStateException("User is not authenticated")
        }

        val normalizedEmail = EmailNormalizer.normalize(email)
        val user = userRepository.findByEmailIgnoreCase(normalizedEmail) ?: throw IllegalStateException("User not found")
        return user.id ?: throw IllegalStateException("User ID is missing")
    }
}
