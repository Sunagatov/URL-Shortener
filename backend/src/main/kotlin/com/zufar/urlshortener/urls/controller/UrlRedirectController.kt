package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.shared.exception.ErrorResponse
import com.zufar.urlshortener.urls.service.UrlMappingProvider
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
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.net.URI

@RestController
@RequestMapping
@Tag(
    name = "URL Redirection",
    description = "Operations related to redirecting shortened URLs to their original destinations."
)
class UrlRedirectController(private val urlMappingProvider: UrlMappingProvider) {

    private val log = LoggerFactory.getLogger(UrlRedirectController::class.java)

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
                              "errorMessage": "An unexpected error occurred."
                            }
                        """
                    )
                ]
            )
        ]
    )
    @GetMapping("/url/{urlHash}")
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
        log.info("Redirect request for urlHash='{}' from IP='{}'", urlHash, httpServletRequest.remoteAddr)
        val urlMapping = urlMappingProvider.getPublicUrlMappingByHash(urlHash)
        log.info("Redirecting to originalUrl='{}'", urlMapping.originalUrl)
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI(urlMapping.originalUrl))
            .build()
    }
}
