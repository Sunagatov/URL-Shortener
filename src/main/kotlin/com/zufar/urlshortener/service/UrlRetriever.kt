package com.zufar.urlshortener.service

import com.zufar.urlshortener.exception.UrlNotFoundException
import com.zufar.urlshortener.repository.UrlRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class UrlRetriever(
    private val urlRepository: UrlRepository
) {

    fun retrieveUrl(shortUrl: String): Mono<String> {
        return urlRepository.findByShortUrl(shortUrl)
            .map { it.originalUrl }
            .switchIfEmpty(Mono.error(UrlNotFoundException("Short URL='$shortUrl' not found")))
    }
}
