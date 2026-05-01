package com.zufar.urlshortener.auth.dto

import jakarta.validation.constraints.NotBlank

data class SignInRequest(

    @field:NotBlank(message = EMAIL_MUST_NOT_BE_EMPTY)
    val email: String,

    @field:NotBlank(message = PASSWORD_MUST_NOT_BE_EMPTY)
    val password: String
)
