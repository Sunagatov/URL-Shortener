package com.zufar.urlshortener.urls.service.command

import com.zufar.urlshortener.urls.dto.ShortenUrlRequest
import com.zufar.urlshortener.urls.repository.UrlRepository
import com.zufar.urlshortener.urls.service.DaysCountValidator
import com.zufar.urlshortener.urls.service.StringEncoder
import com.zufar.urlshortener.urls.service.UrlMappingEntityCreator
import com.zufar.urlshortener.urls.service.UrlValidator
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.dao.DuplicateKeyException
import org.springframework.stereotype.Service

private const val MAX_CODE_GENERATION_ATTEMPTS = 10

@Service
class ShortenUrlService(
    private val urlRepository: UrlRepository,
    private val urlValidator: UrlValidator,
    private val daysCountValidator: DaysCountValidator,
    private val urlMappingEntityCreator: UrlMappingEntityCreator,
    @Value("\${app.base-url}") private val baseUrl: String
) {
    private val log = LoggerFactory.getLogger(ShortenUrlService::class.java)

    fun shorten(shortenUrlRequest: ShortenUrlRequest, httpServletRequest: HttpServletRequest): String {
        val normalizedRequest = normalize(shortenUrlRequest)
        val normalizedBaseUrl = baseUrl.trimEnd('/')

        log.info(
            "Shortening originalURL='{}' from IP='{}'",
            normalizedRequest.originalUrl,
            httpServletRequest.remoteAddr
        )

        urlValidator.validateUrl(normalizedRequest.originalUrl)
        daysCountValidator.validateDaysCount(normalizedRequest.daysCount)

        repeat(MAX_CODE_GENERATION_ATTEMPTS) { attempt ->
            val urlHash = StringEncoder.generate()
            val shortUrl = "$normalizedBaseUrl/$urlHash"
            val urlMapping = urlMappingEntityCreator.create(normalizedRequest, httpServletRequest, urlHash, shortUrl)

            try {
                urlRepository.insert(urlMapping)
                log.info("Created shortUrl='{}' for originalURL='{}'", shortUrl, normalizedRequest.originalUrl)
                return shortUrl
            } catch (_: DuplicateKeyException) {
                log.warn("Short code collision for urlHash='{}' on attempt {}", urlHash, attempt + 1)
            }
        }

        throw IllegalStateException("Failed to generate a unique short code after $MAX_CODE_GENERATION_ATTEMPTS attempts")
    }

    private fun normalize(request: ShortenUrlRequest): ShortenUrlRequest {
        val trimmedOriginalUrl = request.originalUrl.trim()
        return if (trimmedOriginalUrl == request.originalUrl) {
            request
        } else {
            request.copy(originalUrl = trimmedOriginalUrl)
        }
    }
}
