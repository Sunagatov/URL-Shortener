package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.dto.*
import com.zufar.urlshortener.analytics.entity.EventType
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.Instant

@Service
class UrlAnalyticsQueryService(
    private val aggregationService: AnalyticsAggregationService
) {

    fun summary(urlHash: String, from: Instant, to: Instant, timezone: String, includeBots: Boolean, eventType: EventType?): AnalyticsSummaryResponse {
        val rangeDuration = Duration.between(from, to)
        val previousFrom = from.minus(rangeDuration)
        val previousTo = from

        val clicksInRange = aggregationService.countEvents(urlCriteria(urlHash, from, to, includeBots, eventType))
        val previousPeriodClicks = aggregationService.countEvents(urlCriteria(urlHash, previousFrom, previousTo, includeBots, eventType))
        val totalClicks = aggregationService.countEvents(urlBaseCriteria(urlHash, includeBots, eventType))
        val uniqueVisitors = aggregationService.estimateUniqueVisitors(urlCriteria(urlHash, from, to, includeBots, eventType))

        return AnalyticsSummaryResponse(
            urlHash = urlHash,
            selectedRange = AnalyticsDateRange(from, to, timezone),
            metrics = aggregationService.buildMetrics(totalClicks, clicksInRange, previousPeriodClicks, uniqueVisitors),
            filters = AnalyticsFilters(eventType = eventType?.name, includeBots = includeBots)
        )
    }

    fun timeseries(urlHash: String, from: Instant, to: Instant, timezone: String, includeBots: Boolean, eventType: EventType?): AnalyticsTimeseriesResponse {
        val bucket = aggregationService.selectBucket(from, to)
        val points = aggregationService.aggregateTimeseries(urlCriteria(urlHash, from, to, includeBots, eventType), bucket, timezone)
        return AnalyticsTimeseriesResponse(urlHash = urlHash, bucket = bucket, points = points)
    }

    fun breakdown(urlHash: String, from: Instant, to: Instant, dimension: String, includeBots: Boolean, limit: Int, eventType: EventType?): AnalyticsBreakdownResponse {
        val field = aggregationService.dimensionToField(dimension)
        val items = aggregationService.aggregateBreakdown(urlCriteria(urlHash, from, to, includeBots, eventType), field, limit)
        return AnalyticsBreakdownResponse(dimension = dimension, items = items)
    }

    private fun urlCriteria(urlHash: String, from: Instant, to: Instant, includeBots: Boolean, eventType: EventType?): Criteria {
        val criteria = Criteria.where("urlHash").`is`(urlHash)
            .and("occurredAt").gte(from).lt(to)
        if (!includeBots) criteria.and("isBot").`is`(false)
        if (eventType != null) criteria.and("eventType").`is`(eventType)
        return criteria
    }

    private fun urlBaseCriteria(urlHash: String, includeBots: Boolean, eventType: EventType?): Criteria {
        val criteria = Criteria.where("urlHash").`is`(urlHash)
        if (!includeBots) criteria.and("isBot").`is`(false)
        if (eventType != null) criteria.and("eventType").`is`(eventType)
        return criteria
    }
}
