package com.zufar.urlshortener.shorten.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Response payload containing the shortened URL")
data class UrlResponse(

    @Schema(description = "The shortened URL that corresponds to the original URL",
        example = "https://short-link.zufargroup.com/65DcFj")
    val shortUrl: String
)
