package com.zufar.urlshortener.urls.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size


data class ShortenUrlRequest(

    @field:NotBlank(message = "URL cannot be blank")
    @field:Size(max = 2048, message = "URL too long")
    val originalUrl: String,

    @field:Min(value = 1, message = "Days count must be at least 1")
    @field:Max(value = 365, message = "Days count cannot exceed 365")
    val daysCount: Long?,

    @field:Size(min = 3, max = 30, message = "Custom alias must be between 3 and 30 characters")
    val customAlias: String? = null,

    @field:Size(max = 2048, message = "Turnstile token is too long")
    val turnstileToken: String? = null
)
