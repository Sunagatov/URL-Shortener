package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.shorten.dto.ShortenUrlRequest
import com.zufar.urlshortener.shorten.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.dao.DuplicateKeyException
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
        val normalizedOriginalUrl = shortenUrlRequest.originalUrl.trim()
        val normalizedBaseUrl = baseUrl.trimEnd('/')

        log.info("Shortening originalURL='{}' from IP='{}'", normalizedOriginalUrl, httpServletRequest.remoteAddr)

        urlValidator.validateUrl(normalizedOriginalUrl)
        daysCountValidator.validateDaysCount(shortenUrlRequest.daysCount)

        val normalizedRequest =
            if (normalizedOriginalUrl == shortenUrlRequest.originalUrl) {
                shortenUrlRequest
            } else {
                shortenUrlRequest.copy(originalUrl = normalizedOriginalUrl)
            }

        repeat(MAX_CODE_GENERATION_ATTEMPTS) { attempt ->
            val urlHash = StringEncoder.generate()
            val shortUrl = "$normalizedBaseUrl/url/$urlHash"
            val urlMapping = urlMappingEntityCreator.create(normalizedRequest, httpServletRequest, urlHash, shortUrl)

            try {
                urlRepository.insert(urlMapping)
                log.info("Created shortUrl='{}' for originalURL='{}'", shortUrl, normalizedOriginalUrl)
                return shortUrl
            } catch (_: DuplicateKeyException) {
                log.warn("Short code collision for urlHash='{}' on attempt {}", urlHash, attempt + 1)
            }
        }

        throw IllegalStateException("Failed to generate a unique short code after $MAX_CODE_GENERATION_ATTEMPTS attempts")
    }
}
