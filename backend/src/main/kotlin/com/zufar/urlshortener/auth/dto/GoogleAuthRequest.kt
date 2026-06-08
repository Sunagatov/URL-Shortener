package com.zufar.urlshortener.auth.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class GoogleAuthRequest(
    @field:NotBlank(message = "Authorization code must not be empty")
    val code: String,

    @field:Size(max = 2048, message = "Turnstile token is too long")
    val turnstileToken: String? = null
)
