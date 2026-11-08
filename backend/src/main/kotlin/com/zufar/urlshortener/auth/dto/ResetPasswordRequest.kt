package com.zufar.urlshortener.auth.dto

import com.zufar.urlshortener.shared.security.NewPassword
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class ResetPasswordRequest(

    @field:NotBlank(message = "Reset token must not be empty")
    val token: String,

    @field:NotBlank(message = PASSWORD_MUST_NOT_BE_EMPTY)
    @field:NewPassword
    val newPassword: String,

    @field:Size(max = 2048, message = "Turnstile token is too long")
    val turnstileToken: String? = null
)
