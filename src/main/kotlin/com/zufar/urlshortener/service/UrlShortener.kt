package com.zufar.urlshortener.service

import com.zufar.urlshortener.common.dto.UrlRequest
import com.zufar.urlshortener.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service


@Service
class UrlShortener(
    private val urlRepository: UrlRepository,
    private val urlValidator: UrlValidator,
    private val daysCountValidator: DaysCountValidator,
    private val urlMappingEntityCreator: UrlMappingEntityCreator
) {
    private val log = LoggerFactory.getLogger(UrlShortener::class.java)

    @Value("\${app.base-url}")
    private lateinit var baseUrl: String

    fun shortenUrl(urlRequest: UrlRequest,
                   httpServletRequest: HttpServletRequest): String {
        val originalUrl = urlRequest.originalUrl
        val clientIp = httpServletRequest.remoteAddr
        val userAgent = httpServletRequest.getHeader("User-Agent")

        log.info("Trying to shorten originalURL='{}' from IP='{}', User-Agent='{}'", originalUrl, clientIp, userAgent)

        urlValidator.validateUrl(originalUrl)
        daysCountValidator.validateDaysCount(urlRequest.daysCount)
        log.debug("URL validation passed for originalURL='{}'", originalUrl)

        val urlHash = StringEncoder.encode(originalUrl)
        log.debug("Encoded originalURL='{}' to urlHash='{}'", originalUrl, urlHash)

        val newShortUrl = "$baseUrl/url/$urlHash"
        log.info("Generated new shortURL='{}' for originalURL='{}'", newShortUrl, originalUrl)

        val urlMapping = urlMappingEntityCreator.create(urlRequest, httpServletRequest, urlHash, newShortUrl)
        urlRepository.save(urlMapping)
        log.info("Saved URL mapping for urlHash='{}' in MongoDB", urlHash)

        return newShortUrl
    }
}
