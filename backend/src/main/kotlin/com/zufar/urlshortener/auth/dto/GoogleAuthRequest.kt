package com.zufar.urlshortener.auth.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern

data class GoogleAuthRequest(
    @field:NotBlank(message = "Authorization code must not be empty")
    val code: String,
    @field:NotBlank
    @field:Pattern(regexp = "[A-Za-z0-9._~-]{43,128}", message = "Invalid PKCE verifier")
    val codeVerifier: String
)
