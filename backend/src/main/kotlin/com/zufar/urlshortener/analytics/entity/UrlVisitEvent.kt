package com.zufar.urlshortener.analytics.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.CompoundIndexes
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

private const val RETENTION_DAYS = "7776000s" // 90 days

@Document(collection = "url_visit_events")
@CompoundIndexes(
    CompoundIndex(name = "url_occurred_idx", def = "{'urlHash': 1, 'occurredAt': -1}"),
    CompoundIndex(name = "user_occurred_idx", def = "{'userId': 1, 'occurredAt': -1}"),
    CompoundIndex(name = "url_event_occurred_idx", def = "{'urlHash': 1, 'eventType': 1, 'occurredAt': -1}"),
    CompoundIndex(name = "user_event_occurred_idx", def = "{'userId': 1, 'eventType': 1, 'occurredAt': -1}")
)
data class UrlVisitEvent(
    @Id
    val id: String? = null,
    val urlHash: String,
    val userId: String?,
    val eventType: EventType,
    @Indexed(name = "event_retention_ttl_idx", expireAfter = RETENTION_DAYS)
    val occurredAt: Instant,
    val referrerRaw: String?,
    val referrerDomain: String?,
    val referrerCategory: String?,
    val countryCode: String?,
    val city: String?,
    val deviceType: DeviceType,
    val browser: String?,
    val browserVersionMajor: String?,
    val operatingSystem: String?,
    val operatingSystemVersionMajor: String?,
    val ipHash: String?,
    val userAgentHash: String?,
    val isBot: Boolean,
    val botCategory: BotCategory?,
    val sourceType: SourceType,
    val metadataVersion: Int = 1
)
