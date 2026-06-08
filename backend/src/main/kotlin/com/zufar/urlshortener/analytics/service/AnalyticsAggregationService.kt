package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.dto.AnalyticsMetrics
import com.zufar.urlshortener.analytics.dto.BreakdownItem
import com.zufar.urlshortener.analytics.dto.TimeseriesPoint
import com.zufar.urlshortener.analytics.entity.UrlVisitEvent
import org.bson.Document
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.aggregation.Aggregation.*
import org.springframework.data.mongodb.core.aggregation.AggregationExpression
import org.springframework.data.mongodb.core.aggregation.AggregationOperationContext
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.Instant

@Service
class AnalyticsAggregationService(
    private val mongoTemplate: MongoTemplate
) {

    fun countEvents(criteria: Criteria): Long =
        mongoTemplate.count(Query.query(criteria), UrlVisitEvent::class.java)

    fun estimateUniqueVisitors(criteria: Criteria): Long {
        val agg = newAggregation(
            match(criteria),
            group("ipHash", "userAgentHash").count().`as`("n"),
            group().count().`as`("uniqueCount")
        )
        val result = mongoTemplate.aggregate(agg, "url_visit_events", Document::class.java)
        return result.mappedResults.firstOrNull()?.let { (it["uniqueCount"] as Number).toLong() } ?: 0
    }

    fun buildMetrics(
        totalClicks: Long,
        clicksInRange: Long,
        previousPeriodClicks: Long,
        estimatedUniqueVisitors: Long? = null
    ): AnalyticsMetrics {
        val changeAbsolute = clicksInRange - previousPeriodClicks
        val changePercent = if (previousPeriodClicks > 0) {
            (changeAbsolute.toDouble() / previousPeriodClicks) * 100
        } else null

        return AnalyticsMetrics(
            totalClicks = totalClicks,
            clicksInRange = clicksInRange,
            previousPeriodClicks = previousPeriodClicks,
            changeAbsolute = changeAbsolute,
            changePercent = changePercent?.let { Math.round(it * 100) / 100.0 },
            estimatedUniqueVisitors = estimatedUniqueVisitors
        )
    }

    fun selectBucket(from: Instant, to: Instant): String {
        val hours = Duration.between(from, to).toHours()
        return when {
            hours <= 48 -> "hour"
            hours <= 90 * 24 -> "day"
            else -> "week"
        }
    }

    fun aggregateTimeseries(criteria: Criteria, bucket: String, timezone: String): List<TimeseriesPoint> {
        val dateTruncExpr = object : AggregationExpression {
            override fun toDocument(context: AggregationOperationContext): Document =
                Document("\$dateTrunc", Document("date", "\$occurredAt")
                    .append("unit", bucket)
                    .append("timezone", timezone))
        }

        val agg = newAggregation(
            match(criteria),
            project().and(dateTruncExpr).`as`("bucket"),
            group("bucket").count().`as`("count"),
            sort(Sort.Direction.ASC, "_id")
        )

        val results = mongoTemplate.aggregate(agg, "url_visit_events", Document::class.java)
        return results.mappedResults.map { doc ->
            TimeseriesPoint(
                timestamp = (doc["_id"] as java.util.Date).toInstant(),
                count = (doc["count"] as Number).toLong()
            )
        }
    }

    fun aggregateBreakdown(criteria: Criteria, field: String, limit: Int): List<BreakdownItem> {
        val agg = newAggregation(
            match(criteria),
            group(field).count().`as`("count"),
            sort(Sort.Direction.DESC, "count"),
            limit(limit.toLong())
        )

        val results = mongoTemplate.aggregate(agg, "url_visit_events", Document::class.java)
        val items = results.mappedResults.map { doc ->
            BreakdownItem(
                label = (doc["_id"] as? String) ?: "Unknown",
                count = (doc["count"] as Number).toLong(),
                percentage = 0.0
            )
        }

        val total = items.sumOf { it.count }.toDouble()
        return items.map { item ->
            item.copy(percentage = if (total > 0) Math.round(item.count / total * 10000) / 100.0 else 0.0)
        }
    }

    fun dimensionToField(dimension: String): String = when (dimension) {
        "referrers" -> "referrerCategory"
        "locations" -> "countryCode"
        "devices" -> "deviceType"
        "browsers" -> "browser"
        "operating-systems" -> "operatingSystem"
        else -> throw IllegalArgumentException("Unknown dimension: $dimension")
    }
}
