package com.zufar.urlshortener.analytics.dto

import java.time.Instant

data class AnalyticsDateRange(
    val from: Instant,
    val to: Instant,
    val timezone: String
)

data class AnalyticsMetrics(
    val totalClicks: Long,
    val clicksInRange: Long,
    val previousPeriodClicks: Long,
    val changeAbsolute: Long,
    val changePercent: Double?,
    val estimatedUniqueVisitors: Long?
)

data class AnalyticsFilters(
    val eventType: String?,
    val includeBots: Boolean
)

data class AnalyticsSummaryResponse(
    val urlHash: String?,
    val selectedRange: AnalyticsDateRange,
    val metrics: AnalyticsMetrics,
    val filters: AnalyticsFilters
)

data class TimeseriesPoint(
    val timestamp: Instant,
    val count: Long
)

data class AnalyticsTimeseriesResponse(
    val urlHash: String?,
    val bucket: String,
    val points: List<TimeseriesPoint>
)

data class BreakdownItem(
    val label: String,
    val count: Long,
    val percentage: Double
)

data class AnalyticsBreakdownResponse(
    val dimension: String,
    val items: List<BreakdownItem>
)

data class TopLinkItem(
    val urlHash: String,
    val shortUrl: String,
    val originalUrl: String,
    val clicksInRange: Long
)

data class AnalyticsTopLinksResponse(
    val items: List<TopLinkItem>
)
