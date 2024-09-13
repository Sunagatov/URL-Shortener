package com.zufar.urlshortener.common.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Request payload for shortening a URL.")
data class UrlRequest(

    @Schema(description = "The original URL to be shortened. Must be a valid URL format and not exceed 2048 characters.")
    val url: String
)
