package com.zufar.urlshortener.controller

import com.zufar.urlshortener.shortener.InMemoryUrlRetriever
import com.zufar.urlshortener.dto.UrlRequest
import com.zufar.urlshortener.dto.UrlResponse
import com.zufar.urlshortener.shortener.UrlShortener
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class UrlShortenerController(val urlShortener: UrlShortener,
                             val inMemoryUrlRetriever: InMemoryUrlRetriever
) {

    @PostMapping("/shorten")
    fun shortenUrl(@RequestBody request: UrlRequest): Mono<ResponseEntity<UrlResponse>> {
        return urlShortener.shortenUrl(request.url)
            .map { shortUrl -> ResponseEntity.ok(UrlResponse(shortUrl)) }
            .onErrorResume { Mono.just(ResponseEntity.badRequest().build()) }
    }

    @GetMapping("/retrieve/{shortUrl}")
    fun retrieveUrl(@PathVariable shortUrl: String): Mono<ResponseEntity<UrlResponse>> {
        return inMemoryUrlRetriever.retrieveUrl(shortUrl)
            .map { originalUrl -> ResponseEntity.ok(UrlResponse(originalUrl)) }
            .onErrorResume { Mono.just(ResponseEntity.notFound().build()) }
    }
}


