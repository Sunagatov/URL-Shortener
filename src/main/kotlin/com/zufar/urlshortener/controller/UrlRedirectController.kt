package com.zufar.urlshortener.controller

import com.zufar.urlshortener.service.UrlRetriever
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono
import java.net.URI

@RestController
@RequestMapping
class UrlRedirectController(val urlRetriever: UrlRetriever) {

    @GetMapping("/url/{shortUrl}")
    fun redirect(@PathVariable shortUrl: String): Mono<ResponseEntity<Unit>> {
        return urlRetriever.retrieveUrl(shortUrl)
            .map { originalUrl ->
                ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(originalUrl))
                    .build<Unit>()
            }
            .onErrorResume { Mono.just(ResponseEntity.notFound().build()) }
    }
}
