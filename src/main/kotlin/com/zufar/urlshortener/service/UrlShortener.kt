package com.zufar.urlshortener.service

import com.zufar.urlshortener.common.entity.UrlMapping
import com.zufar.urlshortener.repository.UrlRepository
import lombok.extern.slf4j.Slf4j
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Slf4j
@Service
class UrlShortener(
    private val urlRepository: UrlRepository,
    private val urlValidator: UrlValidator
) {
    private val log = LoggerFactory.getLogger(UrlShortener::class.java)

    @Value("\${app.base-url}")
    private lateinit var baseUrl: String

    fun shortenUrl(originalUrl: String): Mono<String> {
        log.info("Received request to shorten URL: {}", originalUrl)

        urlValidator.validateUrl(originalUrl)
        log.debug("URL validation passed for: {}", originalUrl)

        val encodedUrl = StringEncoder.encode(originalUrl)
        log.debug("Encoded URL: {}", encodedUrl)

        val urlMapping = UrlMapping(encodedUrl, originalUrl)

        val shortUrl = urlRepository.save(urlMapping)
            .map { savedMapping ->
                val shortenedUrl = "$baseUrl/url/${savedMapping.shortUrl}"
                log.info("Shortened URL created: {}", shortenedUrl)
                shortenedUrl
            }

        return shortUrl
    }
}
