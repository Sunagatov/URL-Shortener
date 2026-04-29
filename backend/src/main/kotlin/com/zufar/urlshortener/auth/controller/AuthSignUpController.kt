package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.SignUpRequest
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
class AuthSignUpController(
    private val authService: AuthService
) {

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
}
