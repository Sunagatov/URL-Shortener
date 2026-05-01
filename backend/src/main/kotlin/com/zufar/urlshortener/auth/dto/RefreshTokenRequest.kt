package com.zufar.urlshortener.auth.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RefreshTokenRequest(

    @field:NotBlank(message = "Refresh token must not be empty")
    @field:Size(min = 20, max = 500, message = "Refresh token length is invalid")
    val refreshToken: String
)
