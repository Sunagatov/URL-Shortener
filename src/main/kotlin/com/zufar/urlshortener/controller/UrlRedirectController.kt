package com.zufar.urlshortener.controller

import com.zufar.urlshortener.common.dto.ErrorResponse
import com.zufar.urlshortener.exception.UrlNotFoundException
import com.zufar.urlshortener.repository.UrlRepository
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
import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Value
import java.net.URI

@RestController
@RequestMapping
class UrlRedirectController(private val urlRepository: UrlRepository) {

    private val log = LoggerFactory.getLogger(UrlRedirectController::class.java)

    @Value("\${app.base-url}")
    private lateinit var baseUrl: String

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
                responseCode = "400",
                description = "Original URL is absent",
                content = [Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = Schema(implementation = ErrorResponse::class),
                    examples = [ExampleObject(
                        name = "Missing Original URL",
                        summary = "The original URL could not be found.",
                        value = """{
                            "errorMessage": "Original URL is absent for short URL='abcd1234'"
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
        "/url/{urlHash}",
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun redirect(
        @Parameter(
            description = "Shortened URL identifier",
            required = true,
            schema = Schema(type = "string", maxLength = 15)
        )
        @PathVariable urlHash: String,
        httpServletRequest: HttpServletRequest
    ): ResponseEntity<Unit> {
        val clientIp = httpServletRequest.remoteAddr
        val userAgent = httpServletRequest.getHeader("User-Agent")

        log.info("Received redirect request for shortUrl='{}}/{}' from IP='{}', User-Agent='{}'", baseUrl, urlHash, clientIp, userAgent)

        val urlMapping = urlRepository.findByUrlHash(urlHash)

        if (urlMapping.isEmpty) {
            log.error("Original URL not found for urlHash='{}'", urlHash)
            throw UrlNotFoundException("Original URL is absent for urlHash='$urlHash'")
        }

        log.info("Redirecting to the originalUrl='{}'", urlMapping.get().originalUrl)
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI(urlMapping.get().originalUrl))
            .build()
    }
}
