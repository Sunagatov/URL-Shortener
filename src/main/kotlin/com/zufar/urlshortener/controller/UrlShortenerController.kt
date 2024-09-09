package com.zufar.urlshortener.controller

import com.zufar.urlshortener.common.dto.UrlRequest
import com.zufar.urlshortener.common.dto.UrlResponse
import com.zufar.urlshortener.service.UrlShortener
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class UrlShortenerController(private val urlShortener: UrlShortener) {

    private val log = LoggerFactory.getLogger(UrlShortenerController::class.java)

    @PostMapping("/shorten",
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE])
    fun shortenUrl(@RequestBody urlRequest: UrlRequest): Mono<UrlResponse> {
        log.info("Received request to shorten URL: {}", urlRequest.url)

        return urlShortener
            .shortenUrl(urlRequest.url)
            .map { shortUrl ->
                log.info("Successfully shortened URL: {} to {}", urlRequest.url, shortUrl)
                UrlResponse(shortUrl)
            }
            .doOnError { ex ->
                log.error("Failed to shorten URL: {}", urlRequest.url, ex)
            }
    }
}
