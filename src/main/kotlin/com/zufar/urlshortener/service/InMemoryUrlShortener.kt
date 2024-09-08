package com.zufar.urlshortener.service

import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class InMemoryUrlShortener {

    private val urlMap = mutableMapOf<String, String>()

    fun shortenUrl(originalUrl: String): Mono<String> {
        val shortUrl = "shortUrl123" // Simple fixed short URL for demonstration
        urlMap[shortUrl] = originalUrl
        return Mono.just(shortUrl)
    }

    fun getUrlMap(): Map<String, String> = urlMap
}