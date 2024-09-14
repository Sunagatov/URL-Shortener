package com.zufar.urlshortener.controller

import com.zufar.urlshortener.common.dto.ErrorResponse
import com.zufar.urlshortener.service.UrlRetriever
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.media.ExampleObject
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono
import java.net.URI

@RestController
@RequestMapping
class UrlRedirectController(private val urlRetriever: UrlRetriever) {

    private val log = LoggerFactory.getLogger(UrlRedirectController::class.java)

    @Operation(
        summary = "Redirect to the original URL",
        description = "Redirects the user to the original URL based on the shortened URL identifier",
        tags = ["URL Redirection"]
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "302",
                description = "Redirection successful",
                content = [Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = Schema(implementation = ErrorResponse::class),
                    examples = [ExampleObject(
                        name = "Successful Redirection",
                        summary = "Successfully redirected to the original URL.",
                        value = """{
                            "shortUrl": "http://short.link/abcd1234",
                            "originalUrl": "http://example.com/original"
                        }"""
                    )]
                )]
            ),
            ApiResponse(
                responseCode = "404",
                description = "Shortened URL not found",
                content = [Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = Schema(implementation = ErrorResponse::class),
                    examples = [ExampleObject(
                        name = "Short URL Not Found",
                        summary = "The shortened URL does not exist.",
                        value = """{
                            "errorMessage": "Short URL='65DcFdfddj' not found"
                        }"""
                    )]
                )]
            ),
            ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = [Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = Schema(implementation = ErrorResponse::class),
                    examples = [ExampleObject(
                        name = "General Error",
                        summary = "An unexpected error occurred.",
                        value = """{
                            "errorMessage": "An unexpected error occurred"
                        }"""
                    )]
                )]
            )
        ]
    )
    @GetMapping(
        "/url/{shortUrl}",
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun redirect(
        @Parameter(
            description = "Shortened URL identifier",
            required = true,
            schema = Schema(type = "string", maxLength = 15)
        )
        @PathVariable shortUrl: String
    ): Mono<ResponseEntity<Unit>> {
        log.info("Received request to redirect shortUrl='{}'", shortUrl)

        return urlRetriever
            .retrieveUrl(shortUrl)
            .map { originalUrl ->
                log.info("Successfully found originalUrl='{}' for shortUrl='{}'", originalUrl, shortUrl)
                log.info("Redirecting to original URL='{}'", originalUrl)
                ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI(originalUrl))
                    .build()
            }
    }
}
