package com.zufar.urlshortener.health.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Health status response payload.")
data class HealthStatusResponse(
    @Schema(description = "Application status.", example = "UP")
    val status: String,
    @Schema(description = "Unix timestamp in milliseconds when the health response was generated.", example = "1713350400000")
    val timestamp: Long
)
