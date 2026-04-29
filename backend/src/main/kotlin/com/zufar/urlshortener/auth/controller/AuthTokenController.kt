package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenResponse
import com.zufar.urlshortener.auth.service.token.RefreshAccessTokenService
import com.zufar.urlshortener.shared.exception.ErrorResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.ExampleObject
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import io.swagger.v3.oas.annotations.parameters.RequestBody as SwaggerRequestBody
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
@Tag(
    name = "Authentication",
    description = "Endpoints for user authentication, registration, and token management."
)
class AuthTokenController(
    private val refreshAccessTokenService: RefreshAccessTokenService
) {

    @Operation(
        summary = "Refresh Access Token",
        description = "Obtain a new access token using a valid refresh token."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully refreshed access token.",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = RefreshTokenResponse::class),
                        examples = [
                            ExampleObject(
                                name = "SuccessResponse",
                                summary = "Successful Token Refresh",
                                value = """
                                    {
                                      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    }
                                """
                            )
                        ]
                    )
                ]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid request data.",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "InvalidRequest",
                                summary = "Missing or invalid refresh token",
                                value = """
                                    {
                                      "errorMessage": "Refresh token must not be empty."
                                    }
                                """
                            )
                        ]
                    )
                ]
            ),
            ApiResponse(
                responseCode = "401",
                description = "Invalid or expired refresh token.",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "InvalidToken",
                                summary = "Refresh token invalid or expired",
                                value = """
                                    {
                                      "errorMessage": "Invalid or expired refresh token."
                                    }
                                """
                            )
                        ]
                    )
                ]
            ),
            ApiResponse(
                responseCode = "404",
                description = "User not found.",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "UserNotFound",
                                summary = "No user associated with the refresh token",
                                value = """
                                    {
                                      "errorMessage": "User not found for the provided refresh token."
                                    }
                                """
                            )
                        ]
                    )
                ]
            )
        ]
    )
    @PostMapping("/refresh-token")
    fun refreshAccessToken(
        @SwaggerRequestBody(
            description = "Refresh token request.",
            required = true,
            content = [
                Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = RefreshTokenRequest::class),
                    examples = [
                        ExampleObject(
                            name = "RefreshTokenExample",
                            summary = "Example RefreshTokenRequest",
                            value = """
                                {
                                  "refreshToken": "dGhpc0lzQVJlZnJlc2hUb2tlbi..."
                                }
                            """
                        )
                    ]
                )
            ]
        )
        @RequestBody refreshTokenRequest: RefreshTokenRequest
    ): ResponseEntity<RefreshTokenResponse> =
        ResponseEntity.ok(refreshAccessTokenService.refresh(refreshTokenRequest))
}
