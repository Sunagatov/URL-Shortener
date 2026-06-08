package com.zufar.urlshortener.analytics.controller

import com.zufar.urlshortener.analytics.entity.EventType
import com.zufar.urlshortener.shared.exception.ApplicationException
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.Instant
import kotlin.test.assertEquals

class AnalyticsRequestValidationTest {

    @Test
    fun `resolveAnalyticsDateRange returns canonical timezone id`() {
        val range = resolveAnalyticsDateRange(
            from = Instant.parse("2024-01-01T00:00:00Z"),
            to = Instant.parse("2024-01-02T00:00:00Z"),
            timezone = "Europe/London"
        )

        assertEquals("Europe/London", range.timezone)
    }

    @Test
    fun `resolveAnalyticsDateRange rejects inverted range`() {
        val ex = assertThrows<ApplicationException> {
            resolveAnalyticsDateRange(
                from = Instant.parse("2024-01-02T00:00:00Z"),
                to = Instant.parse("2024-01-01T00:00:00Z"),
                timezone = "UTC"
            )
        }

        assertEquals("INVALID_ANALYTICS_REQUEST", ex.code)
        assertEquals("from must be before to", ex.message)
    }

    @Test
    fun `resolveAnalyticsDateRange rejects invalid timezone`() {
        val ex = assertThrows<ApplicationException> {
            resolveAnalyticsDateRange(
                from = Instant.parse("2024-01-01T00:00:00Z"),
                to = Instant.parse("2024-01-02T00:00:00Z"),
                timezone = "not-a-zone"
            )
        }

        assertEquals("INVALID_ANALYTICS_REQUEST", ex.code)
        assertEquals("timezone must be a valid time zone", ex.message)
    }

    @Test
    fun `parseAnalyticsEventType parses known event type case-insensitively`() {
        assertEquals(EventType.QR_SCAN, parseAnalyticsEventType("qr_scan"))
    }

    @Test
    fun `parseAnalyticsEventType rejects unknown event type`() {
        val ex = assertThrows<ApplicationException> {
            parseAnalyticsEventType("download")
        }

        assertEquals("INVALID_ANALYTICS_REQUEST", ex.code)
    }

    @Test
    fun `validateAnalyticsLimit rejects values outside supported range`() {
        val ex = assertThrows<ApplicationException> {
            validateAnalyticsLimit(101)
        }

        assertEquals("INVALID_ANALYTICS_REQUEST", ex.code)
        assertEquals("limit must be between 1 and 100", ex.message)
    }
}
