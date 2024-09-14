package com.zufar.urlshortener.service

import com.zufar.urlshortener.exception.UrlNotFoundException
import com.zufar.urlshortener.repository.UrlRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import reactor.kotlin.core.publisher.switchIfEmpty

@Service
class UrlRetriever(
    private val urlRepository: UrlRepository
) {

    private val log = LoggerFactory.getLogger(UrlRetriever::class.java)

    fun retrieveUrl(shortUrl: String): Mono<String> {
        log.info("Received request to retrieve original URL for shortUrl='{}'", shortUrl)

        return urlRepository.findByShortUrl(shortUrl)
            .map { urlMapping ->
                val originalUrl = urlMapping.originalUrl
                log.info("Successfully found originalUrl='{}' for shortUrl='{}'", originalUrl, shortUrl)
                originalUrl
            }
            .switchIfEmpty {
                log.warn("Short URL='{}' not found", shortUrl)
                Mono.error(UrlNotFoundException("Short URL='$shortUrl' not found"))
            }
    }
}
