package com.zufar.urlshortener.urls.service

import java.time.Instant

interface UrlVisitTracker {
    fun track(command: UrlVisitTrackingCommand)
}

data class UrlVisitTrackingCommand(
    val urlHash: String,
    val userId: String?,
    val occurredAt: Instant,
    val clientIp: String?,
    val referer: String?,
    val userAgent: String?,
    val sourceType: UrlVisitSourceType,
    val eventType: UrlVisitEventType
)

enum class UrlVisitSourceType {
    REDIRECT,
    QR
}

enum class UrlVisitEventType {
    LINK_CLICK,
    QR_SCAN
}
