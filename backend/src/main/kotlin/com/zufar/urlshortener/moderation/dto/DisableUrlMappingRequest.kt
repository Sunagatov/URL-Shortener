package com.zufar.urlshortener.moderation.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class DisableUrlMappingRequest(
    @field:NotBlank(message = "Disable reason is required")
    @field:Size(max = 500, message = "Disable reason is too long")
    val reason: String
)
