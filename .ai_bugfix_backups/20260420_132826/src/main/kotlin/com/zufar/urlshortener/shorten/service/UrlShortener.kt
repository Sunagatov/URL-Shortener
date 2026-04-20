package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.shorten.dto.ShortenUrlRequest
import com.zufar.urlshortener.shorten.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

@Service
class UrlShortener(
    private val urlRepository: UrlRepository,
    private val urlValidator: UrlValidator,
    private val daysCountValidator: DaysCountValidator,
    private val urlMappingEntityCreator: UrlMappingEntityCreator,
) {
    private val log = LoggerFactory.getLogger(UrlShortener::class.java)

    @Value("\${app.base-url}")
    private lateinit var baseUrl: String

    @Cacheable(value = ["urlMappings"], key = "#shortenUrlRequest.originalUrl")
    fun shortenUrl(shortenUrlRequest: ShortenUrlRequest,
                   httpServletRequest: HttpServletRequest): String {

        val originalUrl = shortenUrlRequest.originalUrl.trim()
        log.info("Shortening originalURL='{}' from IP='{}'", originalUrl, httpServletRequest.remoteAddr)

        urlValidator.validateUrl(originalUrl)
        daysCountValidator.validateDaysCount(shortenUrlRequest.daysCount)

        val urlHash = StringEncoder.encode(originalUrl)

        val existing = urlRepository.findByUrlHash(urlHash)
        if (existing.isPresent) {
            log.debug("Returning existing shortUrl for urlHash='{}'", urlHash)
            return existing.get().shortUrl
        }

        val shortUrl = "$baseUrl/url/$urlHash"
        val urlMapping = urlMappingEntityCreator.create(shortenUrlRequest, httpServletRequest, urlHash, shortUrl)
        urlRepository.save(urlMapping)
        log.info("Created shortUrl='{}' for originalURL='{}'", shortUrl, originalUrl)

        return shortUrl
    }
}