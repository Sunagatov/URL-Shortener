package com.zufar.urlshortener.controller

import com.zufar.urlshortener.common.dto.ErrorResponse
import com.zufar.urlshortener.common.dto.UrlRequest
import com.zufar.urlshortener.common.dto.UrlResponse
import com.zufar.urlshortener.repository.UrlRepository
import com.zufar.urlshortener.service.StringEncoder
import com.zufar.urlshortener.service.UrlShortener
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.parameters.RequestBody as SwaggerRequestBody
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity

@RestController
@RequestMapping("/api/v1")
class UrlShortenerController(
    private val urlShortener: UrlShortener,
    private val urlRepository: UrlRepository
) {
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
                    ), ExampleObject(
                        name = "Invalid Protocol",
                        summary = "The URL uses an unsupported protocol.",
                        value = """{
                            "errorMessage": "URL must use HTTP or HTTPS protocol"
                        }"""
                    ), ExampleObject(
                        name = "Loopback Address",
                        summary = "The URL points to a loopback address.",
                        value = """{
                            "errorMessage": "URL cannot point to a loopback address"
                        }"""
                    ), ExampleObject(
                        name = "URL Too Long",
                        summary = "The URL exceeds the maximum length.",
                        value = """{
                            "errorMessage": "URL is too long"
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
    @PostMapping(
        "/shorten",
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun shortenUrl(
        @SwaggerRequestBody(
            description = "The URL to shorten",
            required = true,
            content = [Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = Schema(implementation = UrlRequest::class)
            )]
        )
        @RequestBody urlRequest: UrlRequest,
        httpServletRequest: HttpServletRequest
    ): ResponseEntity<UrlResponse> {
        val clientIp = httpServletRequest.remoteAddr
        val userAgent = httpServletRequest.getHeader("User-Agent")
        val originalUrl = urlRequest.originalUrl
        log.info("Received request to shorten the originalUrl='{}' from IP='{}', User-Agent='{}'", originalUrl, clientIp, userAgent)

        log.debug("Trying to encode the originalUrl='{}'", originalUrl)
        val urlHash = StringEncoder.encode(originalUrl)
        log.debug("Encoded the originalUrl='{}' to the urlHash='{}' for checking if originalUrl is added to DB", originalUrl, urlHash)

        log.debug("Attempting to retrieve shortUrl for the urlHash='{}' in the DB", urlHash)
        val urlMapping = urlRepository.findByUrlHash(urlHash)
        var shortUrl = ""
        if (urlMapping.isEmpty) {
            log.info("No existing shortUrl found for the urlHash='{}'. Creating a new one.", urlHash)
            shortUrl = urlShortener.shortenUrl(urlRequest, httpServletRequest)
            log.info("Created a new shortUrl='{}' for originalUrl='{}' and urlHash='{}' successfully.", shortUrl, originalUrl, urlHash)
        } else {
            log.info("Found an existing shortUrl='{}' for urlHash='{}' in the DB", shortUrl, urlHash)
            shortUrl = urlMapping.get().shortUrl
        }

        return ResponseEntity.ok(UrlResponse(shortUrl))
    }
}