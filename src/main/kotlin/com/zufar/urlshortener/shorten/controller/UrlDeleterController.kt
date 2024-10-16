package com.zufar.urlshortener.shorten.controller

import com.zufar.urlshortener.common.exception.ErrorResponse
import com.zufar.urlshortener.shorten.service.UrlDeleter
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/urls")
class UrlDeleterController(
    private val urlDeleter: UrlDeleter
) {
    private val log = LoggerFactory.getLogger(UrlDeleterController::class.java)

    @Operation(
        summary = "Delete a shortened URL",
        description = "Deletes a URL mapping by its unique hash.",
        tags = ["URL Management"]
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "204",
                description = "Successfully deleted the URL mapping."
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
                responseCode = "404",
                description = "URL mapping not found.",
                content = [Content(
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
    @DeleteMapping("/{urlHash}")
    fun deleteUrlMapping(@PathVariable urlHash: String): ResponseEntity<Any> {
        log.info("Received request to delete URL mapping for urlHash='{}'", urlHash)
        urlDeleter.deleteUrl(urlHash)
        log.info("Successfully deleted URL mapping for urlHash='{}'", urlHash)
        return ResponseEntity.noContent().build()
    }
}
