package com.zufar.urlshortener.shorten.controller

import com.zufar.urlshortener.common.exception.ErrorResponse
import com.zufar.urlshortener.shorten.dto.UserDetailsDto
import com.zufar.urlshortener.shorten.service.UserDetailsProvider
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
class UserProviderController(private val userDetailsProvider: UserDetailsProvider) {

    @Operation(
        summary = "Get user details",
        description = "Retrieve details of a user by their ID.",
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved user details.",
                content = [Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = UserDetailsDto::class)
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
                responseCode = "404",
                description = "User not found.",
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
    fun getUserDetails(): ResponseEntity<UserDetailsDto> {
        val userDetails = userDetailsProvider.getUserDetails()
        return ResponseEntity.ok(userDetails)
    }
}
