package com.zufar.urlshortener.service

import com.zufar.urlshortener.common.dto.UrlRequest
import com.zufar.urlshortener.common.entity.UrlMapping
import com.zufar.urlshortener.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.LocalDateTime

private const val DEFAULT_LINK_EXPIRATION_DAYS_COUNT = 365L

@Service
class UrlShortener(
    private val urlRepository: UrlRepository,
    private val urlValidator: UrlValidator,
    private val urlCreator: UrlCreator
) {
    private val log = LoggerFactory.getLogger(UrlShortener::class.java)

    fun shortenUrl(urlRequest: UrlRequest,
                   httpServletRequest: HttpServletRequest): String {
        val originalUrl = urlRequest.originalUrl
        log.info("Received request to shorten originalURL='{}'", originalUrl)

        urlValidator.validateUrl(originalUrl)

        val encodedUrl = StringEncoder.encode(originalUrl)
        log.debug("OriginalURL='{}' was encoded to '{}'", originalUrl, encodedUrl)

        val urlMapping = buildUrlMappingEntity(urlRequest, httpServletRequest, encodedUrl)
        val savedMapping = urlRepository.save(urlMapping)

        val shortUrl = savedMapping.shortUrl
        val newShortURL = urlCreator.create(shortUrl)
        log.info("New shortURL='{}' was created for originalURL='{}'", newShortURL, originalUrl)

        return newShortURL
    }

    private fun buildUrlMappingEntity(
        urlRequest: UrlRequest,
        httpServletRequest: HttpServletRequest,
        encodedUrl: String
    ): UrlMapping {
        val originalUrl = urlRequest.originalUrl
        val requestIp = httpServletRequest.remoteAddr
        val userAgent = httpServletRequest.getHeader("User-Agent")
        val referer = httpServletRequest.getHeader("Referer")
        val acceptLanguage = httpServletRequest.getHeader("Accept-Language")
        val httpMethod = httpServletRequest.method

        val urlMapping = UrlMapping(
            shortUrl = encodedUrl,
            originalUrl = originalUrl,
            createdAt = LocalDateTime.now(),
            expirationDate = LocalDateTime.now().plusDays(DEFAULT_LINK_EXPIRATION_DAYS_COUNT),

            requestIp = requestIp,
            userAgent = userAgent,
            referer = referer,
            acceptLanguage = acceptLanguage,
            httpMethod = httpMethod
        )
        return urlMapping
    }
}
