package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.entity.DeviceType
import com.zufar.urlshortener.analytics.entity.EventType
import com.zufar.urlshortener.analytics.entity.SourceType
import com.zufar.urlshortener.analytics.entity.UrlVisitEvent
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.whenever
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Query
import java.time.Instant
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class AnalyticsCsvExportServiceTest {

    @Mock private lateinit var mongoTemplate: MongoTemplate

    @Test
    fun `exportUrlEvents escapes commas quotes newlines and spreadsheet formulas`() {
        whenever(mongoTemplate.find(any<Query>(), eq(UrlVisitEvent::class.java))).thenReturn(
            listOf(
                event(
                    referrerCategory = "Search, Ads",
                    city = "Line\nBreak",
                    browser = "=cmd|'/C calc'!A0",
                    operatingSystem = "Mac \"OS\""
                )
            )
        )

        val csv = service().exportUrlEvents(
            urlHash = "abc12345",
            from = Instant.parse("2024-01-01T00:00:00Z"),
            to = Instant.parse("2024-01-02T00:00:00Z"),
            includeBots = false,
            eventType = null
        )

        val expected = "occurredAt,urlHash,eventType,referrerCategory,countryCode,city,deviceType,browser,operatingSystem,isBot\n" +
            "2024-01-01T10:15:30Z,abc12345,LINK_CLICK,\"Search, Ads\",US,\"Line\n" +
            "Break\",DESKTOP,'=cmd|'/C calc'!A0,\"Mac \"\"OS\"\"\",false"

        assertEquals(
            expected,
            csv
        )
    }

    private fun service() = AnalyticsCsvExportService(mongoTemplate)

    private fun event(
        referrerCategory: String?,
        city: String?,
        browser: String?,
        operatingSystem: String?
    ) = UrlVisitEvent(
        urlHash = "abc12345",
        userId = "user-123",
        eventType = EventType.LINK_CLICK,
        occurredAt = Instant.parse("2024-01-01T10:15:30Z"),
        referrerRaw = null,
        referrerDomain = null,
        referrerCategory = referrerCategory,
        countryCode = "US",
        city = city,
        deviceType = DeviceType.DESKTOP,
        browser = browser,
        browserVersionMajor = null,
        operatingSystem = operatingSystem,
        operatingSystemVersionMajor = null,
        ipHash = "ip",
        userAgentHash = "ua",
        isBot = false,
        botCategory = null,
        sourceType = SourceType.REDIRECT
    )
}
