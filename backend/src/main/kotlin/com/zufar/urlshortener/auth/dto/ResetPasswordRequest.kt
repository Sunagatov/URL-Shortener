package com.zufar.urlshortener.auth.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class ResetPasswordRequest(

    @field:NotBlank(message = "Reset token must not be empty")
    val token: String,

    @field:NotBlank(message = PASSWORD_MUST_NOT_BE_EMPTY)
    @field:Size(min = 15, message = PASSWORD_MUST_BE_AT_LEAST_15_CHARACTERS_LONG)
    @field:Size(max = 64, message = PASSWORD_IS_TOO_LONG)
    val newPassword: String,

    @field:Size(max = 2048, message = "Turnstile token is too long")
    val turnstileToken: String? = null
)
