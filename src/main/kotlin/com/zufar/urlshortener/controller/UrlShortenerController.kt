package com.zufar.urlshortener.controller

import com.zufar.urlshortener.common.dto.UrlRequest
import com.zufar.urlshortener.common.dto.UrlResponse
import com.zufar.urlshortener.service.UrlShortener
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class UrlShortenerController(private val urlShortener: UrlShortener) {

    @PostMapping("/shorten",
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE])
    fun shortenUrl(@RequestBody urlRequest: UrlRequest): Mono<UrlResponse> {
        return urlShortener
            .shortenUrl(urlRequest.url)
            .map { shortUrl -> UrlResponse(shortUrl) }
    }
}
