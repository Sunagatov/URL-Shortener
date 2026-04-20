package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.shorten.dto.ShortenUrlRequest
import com.zufar.urlshortener.shorten.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

private const val MAX_CODE_GENERATION_ATTEMPTS = 10

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

    fun shortenUrl(
        shortenUrlRequest: ShortenUrlRequest,
        httpServletRequest: HttpServletRequest
    ): String {
        val originalUrl = shortenUrlRequest.originalUrl.trim()
        log.info("Shortening originalURL='{}' from IP='{}'", originalUrl, httpServletRequest.remoteAddr)

        urlValidator.validateUrl(originalUrl)
        daysCountValidator.validateDaysCount(shortenUrlRequest.daysCount)

        val urlHash = generateUniqueCode()
        val shortUrl = "$baseUrl/url/$urlHash"
        val urlMapping = urlMappingEntityCreator.create(shortenUrlRequest, httpServletRequest, urlHash, shortUrl)
        urlRepository.save(urlMapping)
        log.info("Created shortUrl='{}' for originalURL='{}'", shortUrl, originalUrl)

        return shortUrl
    }

    private fun generateUniqueCode(): String {
        repeat(MAX_CODE_GENERATION_ATTEMPTS) {
            val candidate = StringEncoder.generate()
            if (!urlRepository.findByUrlHash(candidate).isPresent) {
                return candidate
            }
        }
        throw IllegalStateException("Failed to generate a unique short code after $MAX_CODE_GENERATION_ATTEMPTS attempts")
    }
}
