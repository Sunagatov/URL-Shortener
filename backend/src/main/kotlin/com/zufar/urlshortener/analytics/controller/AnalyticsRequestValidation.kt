package com.zufar.urlshortener.analytics.controller

import com.zufar.urlshortener.analytics.entity.EventType
import com.zufar.urlshortener.shared.exception.ApplicationException
import java.time.Instant
import java.time.ZoneId
import java.time.temporal.ChronoUnit

private const val INVALID_ANALYTICS_REQUEST_CODE = "INVALID_ANALYTICS_REQUEST"
private const val MAX_ANALYTICS_LIMIT = 100

data class AnalyticsDateRangeParams(
    val from: Instant,
    val to: Instant,
    val timezone: String
)

fun resolveAnalyticsDateRange(from: Instant?, to: Instant?, timezone: String): AnalyticsDateRangeParams {
    val resolvedTimezone = validateTimezone(timezone)
    val resolvedTo = to ?: Instant.now()
    val resolvedFrom = from ?: resolvedTo.minus(7, ChronoUnit.DAYS)
    if (!resolvedFrom.isBefore(resolvedTo)) {
        throw ApplicationException.badRequest(INVALID_ANALYTICS_REQUEST_CODE, "from must be before to")
    }
    return AnalyticsDateRangeParams(resolvedFrom, resolvedTo, resolvedTimezone)
}

fun parseAnalyticsEventType(eventType: String?): EventType? {
    if (eventType.isNullOrBlank()) return null
    return runCatching { EventType.valueOf(eventType.trim().uppercase()) }
        .getOrElse {
            throw ApplicationException.badRequest(
                INVALID_ANALYTICS_REQUEST_CODE,
                "eventType must be one of ${EventType.entries.joinToString(", ") { it.name }}"
            )
        }
}

fun validateAnalyticsLimit(limit: Int): Int {
    if (limit !in 1..MAX_ANALYTICS_LIMIT) {
        throw ApplicationException.badRequest(
            INVALID_ANALYTICS_REQUEST_CODE,
            "limit must be between 1 and $MAX_ANALYTICS_LIMIT"
        )
    }
    return limit
}

private fun validateTimezone(timezone: String): String =
    runCatching { ZoneId.of(timezone).id }
        .getOrElse {
            throw ApplicationException.badRequest(INVALID_ANALYTICS_REQUEST_CODE, "timezone must be a valid time zone")
        }
