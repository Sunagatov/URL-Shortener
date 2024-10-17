package com.zufar.urlshortener.shorten.controller

import com.zufar.urlshortener.common.exception.ErrorResponse
import com.zufar.urlshortener.shorten.dto.UrlMappingDto
import com.zufar.urlshortener.shorten.dto.UrlMappingPageDto
import com.zufar.urlshortener.shorten.service.UrlMappingProvider
import com.zufar.urlshortener.shorten.service.PageableUrlMappingsProvider
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/urls")
class UrlMappingsProviderController(
    private val pageableUrlMappingsProvider: PageableUrlMappingsProvider,
    private val urlMappingProvider: UrlMappingProvider
) {

    @Operation(
        summary = "Get user's URL mappings",
        description = "Retrieve a paginated list of URL mappings created by the authenticated user.",
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved URL mappings.",
                content = [Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = UrlMappingPageDto::class)
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
    @GetMapping
    fun getUserUrlMappings(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<UrlMappingPageDto> {
        val urlMappingsPage = pageableUrlMappingsProvider.getUrlMappingsPage(page, size)
        return ResponseEntity.ok(urlMappingsPage)
    }

    @Operation(
        summary = "Get URL mapping by URL hash",
        description = "Retrieve a URL mapping by its hash.",
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved URL mapping.",
                content = [Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = UrlMappingDto::class)
                )]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Bad request due to invalid URL hash format.",
                content = [Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = Schema(implementation = ErrorResponse::class)
                )]
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized access.",
                content = [Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = Schema(implementation = ErrorResponse::class)
                )]
            ),
            ApiResponse(
                responseCode = "404",
                description = "URL mapping not found.",
                content = [Content(
                    mediaType = MediaType.APPLICATION_JSON_VALUE,
                    schema = Schema(implementation = ErrorResponse::class),
                    examples = [ExampleObject(
                        name = "Not Found",
                        summary = "URL mapping for the provided hash was not found.",
                        value = """{
                            "errorMessage": "URL mapping not found"
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
    @GetMapping("/{urlHash}")
    fun getUrlMappingByHash(@PathVariable urlHash: String): ResponseEntity<UrlMappingDto> {
        val urlMapping = urlMappingProvider.getUrlMappingByHash(urlHash)
        return ResponseEntity.ok(urlMapping)
    }
}
