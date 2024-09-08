package com.zufar.urlshortener.shortener

import com.zufar.urlshortener.encoder.StringEncoder
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class ReactiveUrlShortener : UrlShortener {

    private val urlMap = mutableMapOf<String, String>()

    override fun shortenUrl(originalUrl: String): Mono<String> {
        val shortUrl = StringEncoder.encode(originalUrl)
        urlMap[shortUrl] = originalUrl
        return Mono.just(shortUrl)
    }

    override fun getUrlMap(): Map<String, String> = urlMap
}

