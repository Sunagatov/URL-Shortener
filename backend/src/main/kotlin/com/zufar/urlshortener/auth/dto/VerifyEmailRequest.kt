package com.zufar.urlshortener.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class VerifyEmailRequest(

    @field:NotBlank(message = EMAIL_MUST_NOT_BE_EMPTY)
    @field:Size(max = 254, message = EMAIL_IS_TOO_LONG)
    @field:Email(message = EMAIL_FORMAT_IS_INVALID)
    val email: String,

    @field:Pattern(regexp = "^\\d{6}$", message = "Verification code must contain exactly 6 digits")
    val code: String,

    @field:Size(max = 2048, message = "Turnstile token is too long")
    val turnstileToken: String? = null
)
