package com.zufar.urlshortener.shorten.controller

import com.zufar.urlshortener.common.exception.ErrorResponse
import com.zufar.urlshortener.shorten.dto.UserDetailsDto
import com.zufar.urlshortener.shorten.service.UserDetailsProvider
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
@Tag(
    name = "User Management",
    description = "Operations related to managing and retrieving user details."
)
class UserProviderController(private val userDetailsProvider: UserDetailsProvider) {

    @Operation(
        summary = "Retrieve User Details",
        description = "Fetches details of the authenticated user. The request must be authenticated, and the user must exist in the system.",
        tags = ["User Management"]
    )
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved the user details.",
        content = [Content(
            mediaType = "application/json",
            schema = Schema(implementation = UserDetailsDto::class),
            examples = [ExampleObject(
                name = "User Details Example",
                summary = "Example of a successful response",
                value = """{
                  "firstName": "John",
                  "lastName": "Doe",
                  "email": "john.doe@example.com",
                  "country": "USA",
                  "age": 30,
                  "createdAt": "2024-01-15T10:00:00Z",
                  "updatedAt": "2024-06-20T08:30:00Z"
                }"""
            )]
        )]
    )
    @ApiResponse(
        responseCode = "401",
        description = "Unauthorized access. The request lacks valid authentication credentials.",
        content = [Content(
            mediaType = "application/json",
            schema = Schema(implementation = ErrorResponse::class),
            examples = [ExampleObject(
                name = "Unauthorized Example",
                summary = "Example of an unauthorized response",
                value = """{
                  "errorCode": "UNAUTHORIZED",
                  "errorMessage": "Authentication credentials are required."
                }"""
            )]
        )]
    )
    @ApiResponse(
        responseCode = "404",
        description = "User not found. The requested user does not exist in the system.",
        content = [Content(
            mediaType = "application/json",
            schema = Schema(implementation = ErrorResponse::class),
            examples = [ExampleObject(
                name = "User Not Found Example",
                summary = "Example of a user not found response",
                value = """{
                  "errorCode": "USER_NOT_FOUND",
                  "errorMessage": "User with the given ID does not exist."
                }"""
            )]
        )]
    )
    @ApiResponse(
        responseCode = "500",
        description = "Internal server error. An unexpected error occurred while processing the request.",
        content = [Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = Schema(implementation = ErrorResponse::class),
            examples = [ExampleObject(
                name = "Server Error Example",
                summary = "Example of an internal server error response",
                value = """{
                  "errorCode": "INTERNAL_SERVER_ERROR",
                  "errorMessage": "An unexpected error occurred while processing the request."
                }"""
            )]
        )]
    )
    @GetMapping(
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun getUserDetails(): ResponseEntity<UserDetailsDto> {
        val userDetails = userDetailsProvider.getUserDetails()
        return ResponseEntity.ok(userDetails)
    }
}
