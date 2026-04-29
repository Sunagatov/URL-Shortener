package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.CurrentUserProvider
import com.zufar.urlshortener.urls.dto.ShortenUrlRequest
import com.zufar.urlshortener.urls.entity.UrlMapping
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.LocalDateTime

private const val DEFAULT_EXPIRATION_URL_DAYS = 365L

@Service
class UrlMappingEntityCreator(private val currentUserProvider: CurrentUserProvider) {

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
            userId = currentUserProvider.getCurrentUserIdOrNull()
        )

        log.debug(
            "Created URL mapping: urlHash='{}', shortUrl='{}', originalUrl='{}', createdAt='{}', expirationDate='{}', requestIp='{}', userAgent='{}', userId='{}'",
            urlHash, shortUrl, normalizedOriginalUrl,
            urlMapping.createdAt, urlMapping.expirationDate,
            urlMapping.requestIp, urlMapping.userAgent, urlMapping.userId
        )

        return urlMapping
    }
}
