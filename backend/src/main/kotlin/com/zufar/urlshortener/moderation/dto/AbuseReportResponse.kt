package com.zufar.urlshortener.moderation.dto

data class AbuseReportResponse(
    val reportId: String?,
    val urlHash: String
)
