package com.zufar.urlshortener.controller

import com.zufar.urlshortener.common.dto.ErrorResponse
import com.zufar.urlshortener.service.UrlRetriever
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
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

    @Operation(
        summary = "Redirect to the original URL",
        description = "Redirects the user to the original URL based on the shortened URL identifier.",
        tags = ["URL Redirection"]
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "302", description = "Redirected to the original URL"),
            ApiResponse(
                responseCode = "404",
                description = "Shortened URL not found",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponse::class))]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Bad Request - Invalid URL Identifier",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ErrorResponse::class))]
            )
        ]
    )
    @GetMapping("/url/{shortUrl}")
    fun redirect(
        @Parameter(
            description = "Shortened URL identifier, must not exceed 15 characters",
            required = true,
            schema = Schema(type = "string", maxLength = 15)
        )
        @PathVariable
        shortUrl: String
    ): Mono<ResponseEntity<Unit>> {
        return urlRetriever.retrieveUrl(shortUrl)
            .map { originalUrl ->
                ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(originalUrl))
                    .build<Unit>()
            }
            .onErrorResume { Mono.just(ResponseEntity.notFound().build()) }
    }
}
