package com.zufar.urlshortener.shortener

import reactor.core.publisher.Mono

interface UrlShortener {
    fun shortenUrl(originalUrl: String): Mono<String>
    fun getUrlMap(): Map<String, String>
}
