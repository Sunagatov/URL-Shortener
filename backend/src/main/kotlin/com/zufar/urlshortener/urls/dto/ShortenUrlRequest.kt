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
    val daysCount: Long?
)
