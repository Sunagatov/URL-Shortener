package com.zufar.urlshortener.moderation.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class AbuseReportRequest(
    @field:NotBlank(message = "Short URL or hash is required")
    @field:Size(max = 2048, message = "Short URL or hash is too long")
    val shortUrlOrHash: String,

    @field:Size(max = 500, message = "Reason is too long")
    val reason: String? = null
)
