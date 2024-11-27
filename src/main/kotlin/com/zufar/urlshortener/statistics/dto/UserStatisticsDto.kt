package com.zufar.urlshortener.statistics.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "User statistics data transfer object")
data class UserStatisticsDto(

    @Schema(description = "Total number of shortened links created by the user", example = "5")
    val totalShortLinksCount: Long,

    @Schema(description = "Total number of visits across all user's shortened URLs", example = "6000")
    val totalVisitsCount: Long,

    @Schema(description = "List of statistics for each shortened URL")
    val urlStatistics: List<UrlStatisticsDto>
)
