package com.zufar.urlshortener.controller

import com.zufar.urlshortener.common.dto.ErrorResponse
import com.zufar.urlshortener.common.dto.UrlRequest
import com.zufar.urlshortener.common.dto.UrlResponse
import com.zufar.urlshortener.service.UrlShortener
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema

@RestController
@RequestMapping("/api")
class UrlShortenerController(private val urlShortener: UrlShortener) {

    private val log = LoggerFactory.getLogger(UrlShortenerController::class.java)

    @Operation(
        summary = "Shorten a URL",
        description = "Generates a shortened URL from a given long URL.",
        tags = ["URL Shortening"]
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully shortened URL",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = UrlResponse::class))]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid request - Bad URL format",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponse::class))]
            ),
            ApiResponse(
                responseCode = "500",
                description = "Internal server error - Unexpected error occurred",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponse::class))]
            )
        ]
    )
    @PostMapping("/shorten",
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun shortenUrl(
        @RequestBody urlRequest: UrlRequest
    ): Mono<UrlResponse> {
        log.info("Received request to shorten URL: {}", urlRequest.url)

        return urlShortener
            .shortenUrl(urlRequest.url)
            .map { shortUrl ->
                log.info("Successfully shortened URL: {} to {}", urlRequest.url, shortUrl)
                UrlResponse(shortUrl)
            }
            .doOnError { ex -> log.error("Failed to shorten URL: {}", urlRequest.url, ex) }
    }
}
