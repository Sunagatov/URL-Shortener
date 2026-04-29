package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.shared.exception.ErrorResponse
import com.zufar.urlshortener.urls.dto.ShortenUrlRequest
import com.zufar.urlshortener.urls.dto.UrlResponse
import com.zufar.urlshortener.urls.service.command.ShortenUrlService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import io.swagger.v3.oas.annotations.parameters.RequestBody as SwaggerRequestBody

@RestController
@RequestMapping("/api/v1/urls")
@Tag(
    name = "URL Management",
    description = "Operations for managing shortened URLs, including creating, retrieving, and deleting URL mappings."
)
class UrlShorteningController(
    private val shortenUrlService: ShortenUrlService
) {

    @Operation(
        summary = "Shorten a URL",
        description = "Generates a shortened URL from a given long URL. Returns a shorter unique URL that redirects to the original URL.",
        tags = ["URL Shortening"]
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "URL shortened successfully.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = UrlResponse::class),
                        examples = [
                            ExampleObject(
                                name = "ShortenUrlSuccess",
                                summary = "Successful Response",
                                value = """
                                    {
                                      "shortUrl": "https://short.ly/abc123"
                                    }
                                """
                            )
                        ]
                    )
                ]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid URL provided.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "InvalidUrlError",
                                summary = "The URL is not valid",
                                value = """
                                    {
                                      "errorMessage": "URL must not contain spaces."
                                    }
                                """
                            )
                        ]
                    )
                ]
            ),
            ApiResponse(
                responseCode = "500",
                description = "Unexpected server error.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "ServerError",
                                summary = "Internal server error",
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
        ]
    )
    @PostMapping(
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun shortenUrl(
        @SwaggerRequestBody(
            description = "Payload containing the original URL to be shortened.",
            required = true,
            content = [
                Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = Schema(implementation = ShortenUrlRequest::class),
                    examples = [
                        ExampleObject(
                            name = "ShortenUrlExample",
                            summary = "Example URL to shorten",
                            value = """
                                {
                                  "originalUrl": "https://www.example.com/some/long/url",
                                  "daysCount": 30
                                }
                            """
                        )
                    ]
                )
            ]
        )
        @Valid @RequestBody shortenUrlRequest: ShortenUrlRequest,
        httpServletRequest: HttpServletRequest
    ): ResponseEntity<UrlResponse> =
        ResponseEntity.ok(UrlResponse(shortenUrlService.shorten(shortenUrlRequest, httpServletRequest)))
}
