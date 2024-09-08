package com.zufar.urlshortener.shortener

import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.util.NoSuchElementException

@Service
class InMemoryUrlRetriever {

    private val urlMap = mutableMapOf<String, String>()

    fun retrieveUrl(shortUrl: String): Mono<String> {
        return Mono.justOrEmpty(urlMap[shortUrl])
            .switchIfEmpty(Mono.error(NoSuchElementException("URL not found")))
    }
}