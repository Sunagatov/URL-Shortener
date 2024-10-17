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

    fun create(shortenUrlRequest: ShortenUrlRequest,
               httpServletRequest: HttpServletRequest,
               urlHash: String,
               shortUrl: String): UrlMapping {

        val urlMapping = UrlMapping(
            urlHash = urlHash,
            shortUrl = shortUrl,
            originalUrl = shortenUrlRequest.originalUrl,
            createdAt = LocalDateTime.now(),
            expirationDate = LocalDateTime.now().plusDays(shortenUrlRequest.daysCount ?: DEFAULT_EXPIRATION_URL_DAYS),
            requestIp = httpServletRequest.remoteAddr,
            userAgent = httpServletRequest.getHeader("User-Agent"),
            referer = httpServletRequest.getHeader("Referer"),
            acceptLanguage = httpServletRequest.getHeader("Accept-Language"),
            httpMethod = httpServletRequest.method,
            userId = getUserId()
        )

        log.debug(
            "Created URL mapping: urlHash='{}', shortUrl='{}', originalUrl='{}', createdAt='{}', expirationDate='{}', " +
                    "requestIp='{}', userAgent='{}', referer='{}', acceptLanguage='{}', httpMethod='{}', userId='{}'",
            urlHash,
            shortUrl,
            shortenUrlRequest.originalUrl,
            urlMapping.createdAt,
            urlMapping.expirationDate,
            urlMapping.requestIp,
            urlMapping.userAgent,
            urlMapping.referer,
            urlMapping.acceptLanguage,
            urlMapping.httpMethod,
            urlMapping.userId
        )

        return urlMapping
    }

    private fun getUserId(): String? {
        val authentication = SecurityContextHolder.getContext().authentication
        val email = authentication?.name ?: throw IllegalStateException("User is not authenticated")
        var userId: String? = null
        if ("anonymousUser" != email) {
            val user = userRepository.findByEmail(email) ?: throw IllegalStateException("User not found")
            userId = user.id
        }
        return userId
    }
}