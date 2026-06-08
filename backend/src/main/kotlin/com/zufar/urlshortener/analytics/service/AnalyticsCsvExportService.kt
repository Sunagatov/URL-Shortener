package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.entity.EventType
import com.zufar.urlshortener.analytics.entity.UrlVisitEvent
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Service
import java.time.Instant

private const val MAX_CSV_EXPORT_EVENTS = 10_000

@Service
class AnalyticsCsvExportService(
    private val mongoTemplate: MongoTemplate
) {

    fun exportUrlEvents(urlHash: String, from: Instant, to: Instant, includeBots: Boolean, eventType: EventType?): String {
        val criteria = Criteria.where("urlHash").`is`(urlHash).and("occurredAt").gte(from).lt(to)
        if (!includeBots) criteria.and("isBot").`is`(false)
        if (eventType != null) criteria.and("eventType").`is`(eventType)
        return toCsv(mongoTemplate.find(Query.query(criteria).limit(MAX_CSV_EXPORT_EVENTS), UrlVisitEvent::class.java))
    }

    fun exportAccountEvents(userId: String, from: Instant, to: Instant, includeBots: Boolean, eventType: EventType?): String {
        val criteria = Criteria.where("userId").`is`(userId).and("occurredAt").gte(from).lt(to)
        if (!includeBots) criteria.and("isBot").`is`(false)
        if (eventType != null) criteria.and("eventType").`is`(eventType)
        return toCsv(mongoTemplate.find(Query.query(criteria).limit(MAX_CSV_EXPORT_EVENTS), UrlVisitEvent::class.java))
    }

    private fun toCsv(events: List<UrlVisitEvent>): String {
        val header = "occurredAt,urlHash,eventType,referrerCategory,countryCode,city,deviceType,browser,operatingSystem,isBot"
        val rows = events.joinToString("\n") { e ->
            "${e.occurredAt},${e.urlHash},${e.eventType},${csvEscape(e.referrerCategory)},${csvEscape(e.countryCode)},${csvEscape(e.city)},${e.deviceType},${csvEscape(e.browser)},${csvEscape(e.operatingSystem)},${e.isBot}"
        }
        return "$header\n$rows"
    }

    private fun csvEscape(value: String?): String =
        if (value == null) "" else if (value.contains(',') || value.contains('"')) "\"${value.replace("\"", "\"\"")}\"" else value
}
