package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.*
import com.zufar.urlshortener.auth.service.AuthService
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
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/auth")
@Tag(
    name = "Authentication",
    description = "Endpoints for user authentication, registration, and token management."
)
class AuthController(
    private val authService: AuthService
) {

    @Operation(
        summary = "User Sign-in",
        description = "Authenticate a user with their email and password to obtain access and refresh JWT tokens."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully authenticated user.",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = AuthResponse::class),
                        examples = [
                            ExampleObject(
                                name = "SuccessResponse",
                                summary = "Successful Authentication",
                                value = """
                                    {
                                      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                      "refreshToken": "dGhpc0lzQVJlZnJlc2hUb2tlbi..."
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
                                summary = "Missing or invalid fields",
                                value = """
                                    {
                                      "errorMessage": "Email and password must not be empty."
                                    }
                                """
                            )
                        ]
                    )
                ]
            ),
            ApiResponse(
                responseCode = "401",
                description = "Invalid credentials.",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "Unauthorized",
                                summary = "Wrong email or password",
                                value = """
                                    {
                                      "errorMessage": "Invalid email or password."
                                    }
                                """
                            )
                        ]
                    )
                ]
            )
        ]
    )
    @PostMapping("/signin")
    fun authenticateUser(
        @SwaggerRequestBody(
            description = "User's login credentials.",
            required = true,
            content = [
                Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = SignInRequest::class),
                    examples = [
                        ExampleObject(
                            name = "SignInExample",
                            summary = "Example SignInRequest",
                            value = """
                                {
                                  "email": "user@example.com",
                                  "password": "SecurePassword123!"
                                }
                            """
                        )
                    ]
                )
            ]
    )
    @RequestBody signInRequest: SignInRequest
    ): ResponseEntity<AuthResponse> =
        ResponseEntity.ok(authService.authenticateUser(signInRequest))

    @Operation(
        summary = "User Sign-up",
        description = "Register a new user and obtain access and refresh JWT tokens."
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "User registered successfully.",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = AuthResponse::class),
                        examples = [
                            ExampleObject(
                                name = "SuccessResponse",
                                summary = "Successful Registration",
                                value = """
                                    {
                                      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                                      "refreshToken": "dGhpc0lzQVJlZnJlc2hUb2tlbi..."
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
                                summary = "Missing or invalid fields",
                                value = """
                                    {
                                      "errorMessage": "Required fields are missing or invalid."
                                    }
                                """
                            )
                        ]
                    )
                ]
            ),
            ApiResponse(
                responseCode = "409",
                description = "Email already in use.",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ErrorResponse::class),
                        examples = [
                            ExampleObject(
                                name = "EmailExists",
                                summary = "Email already registered",
                                value = """
                                    {
                                      "errorMessage": "Email is already in use."
                                    }
                                """
                            )
                        ]
                    )
                ]
            )
        ]
    )
    @PostMapping("/signup")
    fun registerUser(
        @SwaggerRequestBody(
            description = "New user's registration details.",
            required = true,
            content = [
                Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = SignUpRequest::class),
                    examples = [
                        ExampleObject(
                            name = "SignUpExample",
                            summary = "Example SignUpRequest",
                            value = """
                                {
                                  "firstName": "Jane",
                                  "lastName": "Doe",
                                  "email": "jane.doe@example.com",
                                  "password": "SecurePassword123!",
                                  "country": "USA",
                                  "age": 28
                                }
                            """
                        )
                    ]
                )
            ]
    )
    @RequestBody signUpRequest: SignUpRequest
    ): ResponseEntity<AuthResponse> =
        ResponseEntity.ok(authService.registerUser(signUpRequest))

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
        ResponseEntity.ok(authService.refreshAccessToken(refreshTokenRequest))
}
