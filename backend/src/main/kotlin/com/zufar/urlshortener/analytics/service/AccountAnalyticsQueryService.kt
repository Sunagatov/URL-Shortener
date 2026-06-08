package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.dto.*
import com.zufar.urlshortener.analytics.entity.EventType
import com.zufar.urlshortener.urls.entity.UrlMapping
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.aggregation.Aggregation.*
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.Instant

@Service
class AccountAnalyticsQueryService(
    private val mongoTemplate: MongoTemplate,
    private val aggregationService: AnalyticsAggregationService
) {

    fun summary(userId: String, from: Instant, to: Instant, timezone: String, includeBots: Boolean, eventType: EventType?): AnalyticsSummaryResponse {
        val rangeDuration = Duration.between(from, to)
        val previousFrom = from.minus(rangeDuration)
        val previousTo = from

        val clicksInRange = aggregationService.countEvents(userCriteria(userId, from, to, includeBots, eventType))
        val previousPeriodClicks = aggregationService.countEvents(userCriteria(userId, previousFrom, previousTo, includeBots, eventType))
        val totalClicks = aggregationService.countEvents(userBaseCriteria(userId, includeBots, eventType))
        val uniqueVisitors = aggregationService.estimateUniqueVisitors(userCriteria(userId, from, to, includeBots, eventType))

        return AnalyticsSummaryResponse(
            urlHash = null,
            selectedRange = AnalyticsDateRange(from, to, timezone),
            metrics = aggregationService.buildMetrics(totalClicks, clicksInRange, previousPeriodClicks, uniqueVisitors),
            filters = AnalyticsFilters(eventType = eventType?.name, includeBots = includeBots)
        )
    }

    fun timeseries(userId: String, from: Instant, to: Instant, timezone: String, includeBots: Boolean, eventType: EventType?): AnalyticsTimeseriesResponse {
        val bucket = aggregationService.selectBucket(from, to)
        val points = aggregationService.aggregateTimeseries(userCriteria(userId, from, to, includeBots, eventType), bucket, timezone)
        return AnalyticsTimeseriesResponse(urlHash = null, bucket = bucket, points = points)
    }

    fun topLinks(userId: String, from: Instant, to: Instant, includeBots: Boolean, limit: Int, eventType: EventType?): AnalyticsTopLinksResponse {
        val criteria = userCriteria(userId, from, to, includeBots, eventType)

        val agg = newAggregation(
            match(criteria),
            group("urlHash").count().`as`("count"),
            sort(Sort.Direction.DESC, "count"),
            limit(limit.toLong())
        )

        val results = mongoTemplate.aggregate(agg, "url_visit_events", org.bson.Document::class.java)
        val urlHashes = results.mappedResults.map { it["_id"] as String to (it["count"] as Number).toLong() }

        val urlMappings = if (urlHashes.isNotEmpty()) {
            mongoTemplate.find(
                Query.query(Criteria.where("_id").`in`(urlHashes.map { it.first })),
                UrlMapping::class.java
            ).associateBy { it.urlHash }
        } else emptyMap()

        val items = urlHashes.map { (hash, clicks) ->
            val mapping = urlMappings[hash]
            TopLinkItem(
                urlHash = hash,
                shortUrl = mapping?.shortUrl ?: "",
                originalUrl = mapping?.originalUrl ?: "",
                clicksInRange = clicks
            )
        }

        return AnalyticsTopLinksResponse(items = items)
    }

    fun breakdown(userId: String, from: Instant, to: Instant, dimension: String, includeBots: Boolean, limit: Int, eventType: EventType?): AnalyticsBreakdownResponse {
        val field = aggregationService.dimensionToField(dimension)
        val items = aggregationService.aggregateBreakdown(userCriteria(userId, from, to, includeBots, eventType), field, limit)
        return AnalyticsBreakdownResponse(dimension = dimension, items = items)
    }

    private fun userCriteria(userId: String, from: Instant, to: Instant, includeBots: Boolean, eventType: EventType?): Criteria {
        val criteria = Criteria.where("userId").`is`(userId)
            .and("occurredAt").gte(from).lt(to)
        if (!includeBots) criteria.and("isBot").`is`(false)
        if (eventType != null) criteria.and("eventType").`is`(eventType)
        return criteria
    }

    private fun userBaseCriteria(userId: String, includeBots: Boolean, eventType: EventType?): Criteria {
        val criteria = Criteria.where("userId").`is`(userId)
        if (!includeBots) criteria.and("isBot").`is`(false)
        if (eventType != null) criteria.and("eventType").`is`(eventType)
        return criteria
    }
}
