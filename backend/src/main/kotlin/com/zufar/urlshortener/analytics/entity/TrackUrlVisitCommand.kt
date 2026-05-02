package com.zufar.urlshortener.analytics.entity

import java.time.Instant

data class TrackUrlVisitCommand(
    val urlHash: String,
    val userId: String?,
    val occurredAt: Instant,
    val clientIp: String,
    val referer: String?,
    val userAgent: String?,
    val sourceType: SourceType,
    val eventType: EventType = EventType.LINK_CLICK
)
