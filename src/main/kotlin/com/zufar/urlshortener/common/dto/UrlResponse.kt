package com.zufar.urlshortener.common.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Response payload containing the shortened URL.")
data class UrlResponse(

    @Schema(description = "The shortened URL that corresponds to the original URL.")
    val shortUrl: String
)
