package com.zufar.urlshortener.urls.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Max


data class ShortenUrlRequest(

    @NotBlank(message = "URL cannot be blank")
    @Size(max = 2048, message = "URL too long")
    val originalUrl: String,

    @Min(value = 1, message = "Days count must be at least 1")
    @Max(value = 365, message = "Days count cannot exceed 365")
    val daysCount: Long?,

    @Size(min = 3, max = 30, message = "Custom alias must be between 3 and 30 characters")
    val customAlias: String? = null,

    @field:Size(max = 2048, message = "Turnstile token is too long")
    val turnstileToken: String? = null
)
