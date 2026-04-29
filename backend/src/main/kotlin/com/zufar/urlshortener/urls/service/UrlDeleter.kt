package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.EmailNormalizer
import com.zufar.urlshortener.urls.exception.UrlNotFoundException
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.slf4j.LoggerFactory
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class UrlDeleter(
    private val urlRepository: UrlRepository,
    private val userRepository: UserRepository
) {
    private val log = LoggerFactory.getLogger(UrlDeleter::class.java)

    fun deleteUrl(urlHash: String) {
        val urlMapping = urlRepository.findByUrlHash(urlHash)
            .orElseThrow {
                log.warn("URL mapping not found for urlHash='{}'", urlHash)
                UrlNotFoundException("No URL mapping found for urlHash='$urlHash'")
            }

        val currentUserId = getCurrentUserId()
        if (urlMapping.userId == null || urlMapping.userId != currentUserId) {
            throw AccessDeniedException("You are not allowed to delete this URL mapping")
        }

        urlRepository.deleteById(urlMapping.urlHash)
        log.info("Deleted URL mapping for urlHash='{}'", urlHash)
    }

    private fun getCurrentUserId(): String {
        val authentication = SecurityContextHolder.getContext().authentication
            ?: throw AuthenticationCredentialsNotFoundException("User is not authenticated")

        val email = authentication.name
        if (email.isBlank() || email == "anonymousUser") {
            throw AuthenticationCredentialsNotFoundException("User is not authenticated")
        }

        val normalizedEmail = EmailNormalizer.normalize(email)
        val user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw UserNotFoundException("User not found")
        return user.id ?: throw UserNotFoundException("User not found")
    }
}
