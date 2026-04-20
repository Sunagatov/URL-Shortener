package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.shorten.dto.ShortenUrlRequest
import com.zufar.urlshortener.shorten.entity.UrlMapping
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.time.LocalDateTime

private const val DEFAULT_EXPIRATION_URL_DAYS = 365L

@Service
class UrlMappingEntityCreator(private val userRepository: UserRepository) {

    private val log = LoggerFactory.getLogger(UrlMappingEntityCreator::class.java)

    fun create(
        shortenUrlRequest: ShortenUrlRequest,
        httpServletRequest: HttpServletRequest,
        urlHash: String,
        shortUrl: String
    ): UrlMapping {
        val normalizedOriginalUrl = shortenUrlRequest.originalUrl.trim()

        val urlMapping = UrlMapping(
            urlHash = urlHash,
            shortUrl = shortUrl,
            originalUrl = normalizedOriginalUrl,
            createdAt = LocalDateTime.now(),
            expirationDate = LocalDateTime.now().plusDays(shortenUrlRequest.daysCount ?: DEFAULT_EXPIRATION_URL_DAYS),
            requestIp = httpServletRequest.remoteAddr,
            userAgent = httpServletRequest.getHeader("User-Agent"),
            userId = getUserId()
        )

        log.debug(
            "Created URL mapping: urlHash='{}', shortUrl='{}', originalUrl='{}', createdAt='{}', expirationDate='{}', requestIp='{}', userAgent='{}', userId='{}'",
            urlHash, shortUrl, normalizedOriginalUrl,
            urlMapping.createdAt, urlMapping.expirationDate,
            urlMapping.requestIp, urlMapping.userAgent, urlMapping.userId
        )

        return urlMapping
    }

    private fun getUserId(): String? {
        val authentication = SecurityContextHolder.getContext().authentication ?: return null
        val email = authentication.name

        if (email.isBlank() || email == "anonymousUser") {
            return null
        }

        val user = userRepository.findByEmail(email) ?: throw IllegalStateException("Authenticated user not found")
        return user.id
    }
}
