package com.zufar.urlshortener.shorten.controller

import com.zufar.urlshortener.common.exception.ErrorResponse
import com.zufar.urlshortener.shorten.dto.ShortenUrlRequest
import com.zufar.urlshortener.shorten.dto.UrlResponse
import com.zufar.urlshortener.shorten.repository.UrlRepository
import com.zufar.urlshortener.shorten.service.StringEncoder
import com.zufar.urlshortener.shorten.service.UrlShortener
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.User
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import io.swagger.v3.oas.annotations.parameters.RequestBody as SwaggerRequestBody

@RestController
@RequestMapping("/api/v1/urls")
class UrlShortenerController(private val urlShortener: UrlShortener,
                             private val urlRepository: UrlRepository) {
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
                content = [Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = Schema(implementation = UrlResponse::class)
                )]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid request",
                content = [Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = Schema(implementation = ErrorResponse::class),
                    examples = [ExampleObject(
                        name = "Invalid URL",
                        summary = "The URL contains spaces.",
                        value = """{
                            "errorMessage": "URL must not contain spaces"
                        }"""
                    )]
                )]
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized access.",
                content = [Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = ErrorResponse::class)
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
    @PostMapping(
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun shortenUrl(
        @SwaggerRequestBody(
            description = "The URL to shorten",
            required = true,
            content = [Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = Schema(implementation = ShortenUrlRequest::class)
            )]
        )
        @RequestBody shortenUrlRequest: ShortenUrlRequest,
        httpServletRequest: HttpServletRequest,
        @AuthenticationPrincipal userDetails: User
    ): ResponseEntity<UrlResponse> {
        val originalUrl = shortenUrlRequest.originalUrl

        log.info("Received request to shorten the originalUrl='{}' from IP='{}', User-Agent='{}'",
            originalUrl, httpServletRequest.remoteAddr, httpServletRequest.getHeader("User-Agent"))

        val urlHash = StringEncoder.encode(originalUrl)
        val urlMapping = urlRepository.findByUrlHash(urlHash)
        val shortUrl: String

        if (urlMapping.isEmpty) {
            log.info("No existing shortUrl found for the urlHash='{}'. Creating a new one.", urlHash)
            shortUrl = urlShortener.shortenUrl(shortenUrlRequest, httpServletRequest)
        } else {
            shortUrl = urlMapping.get().shortUrl
        }

        return ResponseEntity.ok(UrlResponse(shortUrl))
    }
}
