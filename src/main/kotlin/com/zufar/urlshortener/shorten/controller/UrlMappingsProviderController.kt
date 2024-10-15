package com.zufar.urlshortener.shorten.controller

import com.zufar.urlshortener.common.exception.ErrorResponse
import com.zufar.urlshortener.shorten.dto.UrlMappingPageDto
import com.zufar.urlshortener.shorten.service.UserUrlMappingService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/urls")
class UrlMappingsProviderController(
    private val userUrlMappingService: UserUrlMappingService
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
    fun getUserUrlMappings(@RequestParam(defaultValue = "0") page: Int,
                           @RequestParam(defaultValue = "10") size: Int): ResponseEntity<UrlMappingPageDto> {
        val urlMappingsPage = userUrlMappingService.getUrlMappingsByUserId(page, size)
        return ResponseEntity.ok(urlMappingsPage)
    }
}
