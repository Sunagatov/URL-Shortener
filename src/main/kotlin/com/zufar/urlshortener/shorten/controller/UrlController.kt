package com.zufar.urlshortener.shorten.controller

import com.zufar.urlshortener.common.exception.ErrorResponse
import com.zufar.urlshortener.shorten.dto.*
import com.zufar.urlshortener.shorten.repository.UrlRepository
import com.zufar.urlshortener.shorten.service.*
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.*
import io.swagger.v3.oas.annotations.parameters.RequestBody as SwaggerRequestBody
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/urls")
@Tag(
    name = "URL Management",
    description = "Operations for managing shortened URLs, including creating, retrieving, and deleting URL mappings."
)
class UrlController(
    private val urlShortener: UrlShortener,
    private val urlRepository: UrlRepository,
    private val urlDeleter: UrlDeleter,
    private val pageableUrlMappingsProvider: PageableUrlMappingsProvider,
    private val urlMappingProvider: UrlMappingProvider
) {
    private val log = LoggerFactory.getLogger(UrlController::class.java)

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
                responseCode = "401",
                description = "Unauthorized access.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "UnauthorizedError",
                                summary = "Authentication is required",
                                value = """
                                    {
                                      "errorMessage": "Unauthorized access."
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
        @RequestBody shortenUrlRequest: ShortenUrlRequest,
        httpServletRequest: HttpServletRequest
    ): ResponseEntity<UrlResponse> {
        val originalUrl = shortenUrlRequest.originalUrl

        log.info(
            "Received request to shorten the originalUrl='{}' from IP='{}', User-Agent='{}'",
            originalUrl,
            httpServletRequest.remoteAddr,
            httpServletRequest.getHeader("User-Agent")
        )

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

    @Operation(
        summary = "Delete a shortened URL",
        description = "Deletes a URL mapping by its unique hash. The URL mapping can only be deleted by its creator.",
        tags = ["URL Management"]
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "204",
                description = "URL mapping deleted successfully."
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized access.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "UnauthorizedError",
                                summary = "Authentication required",
                                value = """
                                    {
                                      "errorMessage": "Unauthorized access."
                                    }
                                """
                            )
                        ]
                    )
                ]
            ),
            ApiResponse(
                responseCode = "404",
                description = "URL mapping not found.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "NotFoundError",
                                summary = "No URL mapping found for the given hash",
                                value = """
                                    {
                                      "errorMessage": "URL mapping not found."
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
    @DeleteMapping("/{urlHash}")
    fun deleteUrlMapping(
        @Parameter(
            description = "The unique hash identifier of the URL mapping to be deleted.",
            example = "abc123",
            required = true
        )
        @PathVariable urlHash: String
    ): ResponseEntity<Any> {
        log.info("Received request to delete URL mapping for urlHash='{}'", urlHash)
        urlDeleter.deleteUrl(urlHash)
        log.info("Successfully deleted URL mapping for urlHash='{}'", urlHash)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "Get user's URL mappings",
        description = "Retrieve a paginated list of URL mappings created by the authenticated user.",
        tags = ["URL Management"]
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved URL mappings.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = UrlMappingPageDto::class),
                        examples = [
                            ExampleObject(
                                name = "UrlMappingsPageExample",
                                summary = "Example of URL mappings page",
                                value = """
                                    {
                                      "content": [
                                        {
                                          "urlHash": "abc123",
                                          "shortUrl": "https://short.ly/abc123",
                                          "originalUrl": "https://www.example.com/very/long/url1",
                                          "createdAt": "2023-10-17T12:34:56",
                                          "expirationDate": "2024-10-17T12:34:56"
                                        },
                                        {
                                          "urlHash": "def456",
                                          "shortUrl": "https://short.ly/def456",
                                          "originalUrl": "https://www.example.com/very/long/url2",
                                          "createdAt": "2023-10-18T12:34:56",
                                          "expirationDate": "2024-10-18T12:34:56"
                                        }
                                      ],
                                      "page": 0,
                                      "size": 10,
                                      "totalElements": 2,
                                      "totalPages": 1
                                    }
                                """
                            )
                        ]
                    )
                ]
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized access.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "UnauthorizedError",
                                summary = "Authentication required",
                                value = """
                                    {
                                      "errorMessage": "Unauthorized access."
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
    @GetMapping
    fun getUserUrlMappings(
        @Parameter(
            description = "Page number (zero-based).",
            example = "0",
            required = false
        )
        @RequestParam(defaultValue = "0") page: Int,
        @Parameter(
            description = "Page size.",
            example = "10",
            required = false
        )
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<UrlMappingPageDto> {
        val urlMappingsPage = pageableUrlMappingsProvider.getUrlMappingsPage(page, size)
        return ResponseEntity.ok(urlMappingsPage)
    }

    @Operation(
        summary = "Get URL mapping by URL hash",
        description = "Retrieve a URL mapping by its unique hash.",
        tags = ["URL Management"]
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved URL mapping.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = UrlMappingDto::class),
                        examples = [
                            ExampleObject(
                                name = "UrlMappingExample",
                                summary = "Example of a URL mapping",
                                value = """
                                    {
                                      "urlHash": "abc123",
                                      "shortUrl": "https://short.ly/abc123",
                                      "originalUrl": "https://www.example.com/very/long/url",
                                      "createdAt": "2023-10-17T12:34:56",
                                      "expirationDate": "2024-10-17T12:34:56"
                                    }
                                """
                            )
                        ]
                    )
                ]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid URL hash format.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "InvalidUrlHashError",
                                summary = "Invalid URL hash provided",
                                value = """
                                    {
                                      "errorMessage": "Invalid URL hash format."
                                    }
                                """
                            )
                        ]
                    )
                ]
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized access.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "UnauthorizedError",
                                summary = "Authentication required",
                                value = """
                                    {
                                      "errorMessage": "Unauthorized access."
                                    }
                                """
                            )
                        ]
                    )
                ]
            ),
            ApiResponse(
                responseCode = "404",
                description = "URL mapping not found.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "NotFoundError",
                                summary = "URL mapping not found",
                                value = """
                                    {
                                      "errorMessage": "URL mapping not found."
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
    @GetMapping("/{urlHash}")
    fun getUrlMappingByHash(
        @Parameter(
            description = "The unique hash of the URL mapping.",
            example = "abc123",
            required = true
        )
        @PathVariable urlHash: String
    ): ResponseEntity<UrlMappingDto> {
        val urlMapping = urlMappingProvider.getUrlMappingByHash(urlHash)
        return ResponseEntity.ok(urlMapping)
    }
}
