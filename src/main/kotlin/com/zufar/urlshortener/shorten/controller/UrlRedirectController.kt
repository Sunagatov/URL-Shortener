package com.zufar.urlshortener.shorten.controller

import com.zufar.urlshortener.common.exception.ErrorResponse
import com.zufar.urlshortener.shorten.exception.UrlNotFoundException
import com.zufar.urlshortener.shorten.repository.UrlRepository
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.headers.Header
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.net.URI

@RestController
@RequestMapping
@Tag(
    name = "URL Redirection",
    description = "Operations related to redirecting shortened URLs to their original destinations."
)
class UrlRedirectController(private val urlRepository: UrlRepository) {

    private val log = LoggerFactory.getLogger(UrlRedirectController::class.java)

    @Value("\${app.base-url}")
    private lateinit var baseUrl: String

    @Operation(
        summary = "Redirect to the Original URL",
        description = "Redirects the user to the original URL based on the shortened URL identifier."
    )
    @ApiResponse(
        responseCode = "302",
        description = "Redirection to the original URL successful.",
        headers = [
            Header(
                name = "Location",
                description = "The URL to which the client is redirected.",
                schema = Schema(type = "string", format = "uri", example = "https://www.example.com/original-page")
            )
        ]
    )
    @ApiResponse(
        responseCode = "404",
        description = "Shortened URL not found.",
        content = [
            Content(
                mediaType = "application/json",
                schema = Schema(implementation = ErrorResponse::class),
                examples = [
                    ExampleObject(
                        name = "Short URL Not Found",
                        summary = "The shortened URL does not exist.",
                        value = """
                            {
                              "errorCode": "URL_NOT_FOUND",
                              "errorMessage": "Original URL is absent for urlHash='abcd1234'"
                            }
                        """
                    )
                ]
            )
        ]
    )
    @ApiResponse(
        responseCode = "500",
        description = "Internal server error.",
        content = [
            Content(
                mediaType = "application/json",
                schema = Schema(implementation = ErrorResponse::class),
                examples = [
                    ExampleObject(
                        name = "ServerError",
                        summary = "An unexpected error occurred.",
                        value = """
                            {
                              "errorCode": "INTERNAL_SERVER_ERROR",
                              "errorMessage": "An unexpected error occurred."
                            }
                        """
                    )
                ]
            )
        ]
    )
    @GetMapping(
        "/url/{urlHash}",
        produces = ["application/json"]
    )
    fun redirect(
        @Parameter(
            description = "The unique identifier (hash) of the shortened URL.",
            required = true,
            example = "abcd1234",
            schema = Schema(type = "string", maxLength = 15)
        )
        @PathVariable urlHash: String,
        httpServletRequest: HttpServletRequest
    ): ResponseEntity<Unit> {
        val clientIp = httpServletRequest.remoteAddr
        val userAgent = httpServletRequest.getHeader("User-Agent")

        log.info(
            "Received redirect request for shortUrl='{}/{}' from IP='{}', User-Agent='{}'",
            baseUrl,
            urlHash,
            clientIp,
            userAgent
        )

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
