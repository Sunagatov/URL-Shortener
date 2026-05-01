package com.zufar.urlshortener.frontendlogs.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class FrontendLogRequest(

    @field:NotBlank(message = "Log level is required")
    @field:Pattern(
        regexp = "debug|info|warn|error",
        message = "Log level must be one of debug, info, warn, or error"
    )
    val level: String,

    @field:NotBlank(message = "Log message is required")
    @field:Size(max = 160, message = "Log message cannot exceed 160 characters")
    val message: String,

    @field:NotBlank(message = "Runtime is required")
    @field:Pattern(regexp = "browser", message = "Runtime must be browser")
    val runtime: String,

    @field:NotBlank(message = "Session id is required")
    @field:Size(max = 120, message = "Session id cannot exceed 120 characters")
    val sessionId: String,

    @field:NotBlank(message = "Timestamp is required")
    @field:Size(max = 64, message = "Timestamp cannot exceed 64 characters")
    val timestamp: String,

    val context: Map<String, Any?>? = null
)
