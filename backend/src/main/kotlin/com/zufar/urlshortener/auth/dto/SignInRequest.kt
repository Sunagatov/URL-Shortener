package com.zufar.urlshortener.auth.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class SignInRequest(

    @field:NotBlank(message = EMAIL_MUST_NOT_BE_EMPTY)
    val email: String,

    @field:NotBlank(message = PASSWORD_MUST_NOT_BE_EMPTY)
    val password: String,

    @field:Size(max = 2048, message = "Turnstile token is too long")
    val turnstileToken: String? = null
)
