package com.zufar.urlshortener.urls.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.Max

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Request payload for shortening a URL")
data class ShortenUrlRequest(

    @Schema(description = "The original URL to be shortened",
        example = "https://iced-latte.uk/")
    @NotBlank(message = "URL cannot be blank")
    @Size(max = 2048, message = "URL too long")
    val originalUrl: String,

    @Schema(description = "Optional expiration time in days for the shortened URL (min 1, max 365)",
        example = "30")
    @Min(value = 1, message = "Days count must be at least 1")
    @Max(value = 365, message = "Days count cannot exceed 365")
    val daysCount: Long?
)
