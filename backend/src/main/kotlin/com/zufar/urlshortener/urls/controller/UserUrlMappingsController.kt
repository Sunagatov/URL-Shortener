package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.shared.exception.ErrorResponse
import com.zufar.urlshortener.urls.dto.UrlMappingPageDto
import com.zufar.urlshortener.urls.service.query.UserUrlMappingsQueryService
import com.zufar.urlshortener.urls.validation.UrlMappingsPageRequestValidator
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

private const val DEFAULT_PAGE = 0
private const val DEFAULT_SIZE = 10

@RestController
@RequestMapping("/api/v1/urls")
@Tag(
    name = "URL Management",
    description = "Operations for managing shortened URLs, including creating, retrieving, and deleting URL mappings."
)
class UserUrlMappingsController(
    private val userUrlMappingsQueryService: UserUrlMappingsQueryService,
    private val urlMappingsPageRequestValidator: UrlMappingsPageRequestValidator
) {

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
        @Parameter(description = "Page number (zero-based).", example = "0", required = false)
        @RequestParam(defaultValue = "$DEFAULT_PAGE") page: Int,
        @Parameter(description = "Page size.", example = "10", required = false)
        @RequestParam(defaultValue = "$DEFAULT_SIZE") size: Int
    ): ResponseEntity<UrlMappingPageDto> {
        urlMappingsPageRequestValidator.validate(page, size)
        return ResponseEntity.ok(userUrlMappingsQueryService.getPage(page, size))
    }
}
