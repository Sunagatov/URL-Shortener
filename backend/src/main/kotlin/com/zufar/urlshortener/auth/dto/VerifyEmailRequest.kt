package com.zufar.urlshortener.auth.dto

data class VerifyEmailRequest(
    val email: String = "",
    val code: String = ""
)
