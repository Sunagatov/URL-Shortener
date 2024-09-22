package com.zufar.urlshortener.service

import com.zufar.urlshortener.common.dto.UrlRequest
import com.zufar.urlshortener.common.entity.UrlMapping
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.LocalDateTime

private const val DEFAULT_LINK_EXPIRATION_DAYS_COUNT = 365L

@Service
class UrlMappingEntityCreator {

    private val log = LoggerFactory.getLogger(UrlMappingEntityCreator::class.java)

    fun create(
        urlRequest: UrlRequest,
        httpServletRequest: HttpServletRequest,
        urlHash: String,
        shortUrl: String
    ): UrlMapping {
        val urlMapping = UrlMapping(
            urlHash = urlHash,
            shortUrl = shortUrl,
            originalUrl = urlRequest.originalUrl,
            createdAt = LocalDateTime.now(),
            expirationDate = LocalDateTime.now().plusDays(DEFAULT_LINK_EXPIRATION_DAYS_COUNT),
            requestIp = httpServletRequest.remoteAddr,
            userAgent = httpServletRequest.getHeader("User-Agent"),
            referer = httpServletRequest.getHeader("Referer"),
            acceptLanguage = httpServletRequest.getHeader("Accept-Language"),
            httpMethod = httpServletRequest.method
        )

        log.debug(
            "Created URL mapping: urlHash='{}', shortUrl='{}', originalUrl='{}', createdAt='{}', expirationDate='{}', " +
                    "requestIp='{}', userAgent='{}', referer='{}', acceptLanguage='{}', httpMethod='{}'",
            urlHash, shortUrl, urlRequest.originalUrl, urlMapping.createdAt, urlMapping.expirationDate,
            urlMapping.requestIp, urlMapping.userAgent, urlMapping.referer, urlMapping.acceptLanguage, urlMapping.httpMethod
        )

        return urlMapping
    }
}