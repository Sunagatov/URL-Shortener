package com.zufar.urlshortener.auth.dto

import jakarta.validation.constraints.NotBlank

data class GoogleAuthRequest(
    @field:NotBlank(message = "Authorization code must not be empty")
    val code: String
)
