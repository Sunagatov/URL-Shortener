package com.zufar.urlshortener.common.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Represents an error response with a message")
data class ErrorResponse(
    @Schema(description = "Detailed error message", example = "Invalid URL format")
    val message: String
)
