package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.SignInRequest
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
class AuthSignInController(
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
}
