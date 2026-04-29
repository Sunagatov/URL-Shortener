package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.shared.exception.ErrorResponse
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.service.command.DeleteUrlMappingService
import com.zufar.urlshortener.urls.service.query.UrlQueryService
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
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/urls")
@Tag(
    name = "URL Management",
    description = "Operations for managing shortened URLs, including creating, retrieving, and deleting URL mappings."
)
class UserUrlMappingController(
    private val deleteUrlMappingService: DeleteUrlMappingService,
    private val urlQueryService: UrlQueryService
) {

    @Operation(
        summary = "Delete a shortened URL",
        description = "Deletes a URL mapping by its unique hash. The URL mapping can only be deleted by its creator.",
        tags = ["URL Management"]
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "204", description = "URL mapping deleted successfully."),
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
                responseCode = "403",
                description = "The current user does not own the URL mapping.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "ForbiddenError",
                                summary = "User is not allowed to delete this URL mapping",
                                value = """
                                    {
                                      "errorMessage": "You are not allowed to delete this URL mapping"
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
        @Parameter(description = "The unique hash identifier of the URL mapping to be deleted.", example = "abc123", required = true)
        @PathVariable urlHash: String
    ): ResponseEntity<Void> {
        deleteUrlMappingService.delete(urlHash)
        return ResponseEntity.noContent().build()
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
                responseCode = "403",
                description = "The current user does not own the URL mapping.",
                content = [
                    Content(
                        mediaType = MediaType.APPLICATION_JSON_VALUE,
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "ForbiddenError",
                                summary = "User is not allowed to access this URL mapping",
                                value = """
                                    {
                                      "errorMessage": "You are not allowed to access this URL mapping"
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
        @Parameter(description = "The unique hash of the URL mapping.", example = "abc123", required = true)
        @PathVariable urlHash: String
    ): ResponseEntity<UrlMappingDto> =
        ResponseEntity.ok(urlQueryService.getOwnedByHash(urlHash))
}
