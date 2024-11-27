package com.zufar.urlshortener.statistics.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Statistics for a specific shortened URL")
data class UrlStatisticsDto(

    @Schema(description = "Shortened URL", example = "https://short.ly/abc123")
    val shortenedUrl: String,

    @Schema(description = "Original URL", example = "https://www.example.com/long-url")
    val originalUrl: String,

    @Schema(description = "Total number of visits for this URL", example = "3000")
    val totalVisitsCount: Long,
)
