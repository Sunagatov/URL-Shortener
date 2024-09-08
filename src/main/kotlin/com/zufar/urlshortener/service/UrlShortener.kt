package com.zufar.urlshortener.service

import com.zufar.urlshortener.common.entity.UrlMapping
import com.zufar.urlshortener.repository.UrlRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class UrlShortener(
    private val urlRepository: UrlRepository,
    private val urlValidator: UrlValidator
) {

    private val baseUrl = "http://localhost:8080/"

    fun shortenUrl(originalUrl: String): Mono<String> {
        urlValidator.validateUrl(originalUrl)

        val shortUrl = StringEncoder.encode(originalUrl)
        val urlMapping = UrlMapping(shortUrl, originalUrl)

        return urlRepository.save(urlMapping)
            .map { savedMapping -> "$baseUrl${savedMapping.shortUrl}" }
    }
}
