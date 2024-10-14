package com.zufar.urlshortener.auth.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Authentication request containing email and password.")
data class SignInRequest(

    @Schema(description = "User's email address.", example = "user@example.com", required = true)
    val email: String,

    @Schema(description = "User's password.", example = "password123", required = true)
    val password: String
)
