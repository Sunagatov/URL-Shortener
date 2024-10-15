package com.zufar.urlshortener.shorten.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Request payload for shortening a URL")
data class ShortenUrlRequest(

    @Schema(description = "The original URL to be shortened",
        example = "https://iced-latte.uk/")
    val originalUrl: String,

    @Schema(description = "Optional expiration time in days for the shortened URL (min 1, max 365)",
        example = "30")
    val daysCount: Long?
)
