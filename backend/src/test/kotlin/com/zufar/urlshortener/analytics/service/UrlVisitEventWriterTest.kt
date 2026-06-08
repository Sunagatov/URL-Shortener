package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.entity.DeviceType
import com.zufar.urlshortener.analytics.entity.EventType
import com.zufar.urlshortener.analytics.entity.SourceType
import com.zufar.urlshortener.analytics.entity.TrackUrlVisitCommand
import com.zufar.urlshortener.analytics.entity.UrlVisitEvent
import com.zufar.urlshortener.analytics.repository.UrlVisitEventRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.anyOrNull
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import com.zufar.urlshortener.urls.service.UrlVisitCounterService
import java.time.Instant
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UrlVisitEventWriterTest {
    @Mock private lateinit var repository: UrlVisitEventRepository
    @Mock private lateinit var referrerClassifier: ReferrerClassifier
    @Mock private lateinit var userAgentParser: UserAgentParserService
    @Mock private lateinit var geoLookupService: GeoLookupService
    @Mock private lateinit var botDetectionService: BotDetectionService
    @Mock private lateinit var urlVisitCounterService: UrlVisitCounterService

    @Test
    fun `enrichAndPersist strips sensitive referrer query and fragment before storing raw referrer`() {
        whenever(referrerClassifier.classify(anyOrNull())).thenReturn(ReferrerInfo("example.com", "direct"))
        whenever(userAgentParser.parse(anyOrNull())).thenReturn(UserAgentInfo(DeviceType.DESKTOP, "Chrome", "120", "macOS", "14"))
        whenever(geoLookupService.lookup(anyOrNull())).thenReturn(GeoInfo(null, null))
        whenever(botDetectionService.detect(anyOrNull(), any())).thenReturn(BotInfo(false, null))

        writer().enrichAndPersist(
            TrackUrlVisitCommand(
                urlHash = "abc12345",
                userId = "user-123",
                occurredAt = Instant.parse("2024-01-01T10:15:30Z"),
                clientIp = "127.0.0.1",
                referer = "https://example.com/path?token=secret#private",
                userAgent = "JUnit",
                sourceType = SourceType.REDIRECT,
                eventType = EventType.LINK_CLICK
            )
        )

        val captor = argumentCaptor<UrlVisitEvent>()
        verify(repository).save(captor.capture())
        assertEquals("https://example.com/path", captor.firstValue.referrerRaw)
        assertEquals(64, captor.firstValue.ipHash?.length)
        assertEquals(64, captor.firstValue.userAgentHash?.length)
        verify(urlVisitCounterService).incrementVisitCounters("abc12345", false)
    }

    @Test
    fun `enrichAndPersist delegates QR counter update to URL counter service`() {
        whenever(referrerClassifier.classify(anyOrNull())).thenReturn(ReferrerInfo(null, "Direct"))
        whenever(userAgentParser.parse(anyOrNull())).thenReturn(UserAgentInfo(DeviceType.DESKTOP, null, null, null, null))
        whenever(geoLookupService.lookup(anyOrNull())).thenReturn(GeoInfo(null, null))
        whenever(botDetectionService.detect(anyOrNull(), any())).thenReturn(BotInfo(false, null))

        writer().enrichAndPersist(
            TrackUrlVisitCommand(
                urlHash = "abc12345",
                userId = "user-123",
                occurredAt = Instant.parse("2024-01-01T10:15:30Z"),
                clientIp = "127.0.0.1",
                referer = null,
                userAgent = "JUnit",
                sourceType = SourceType.QR,
                eventType = EventType.QR_SCAN
            )
        )

        verify(urlVisitCounterService).incrementVisitCounters("abc12345", true)
    }

    private fun writer() = UrlVisitEventWriter(
        repository = repository,
        referrerClassifier = referrerClassifier,
        userAgentParser = userAgentParser,
        geoLookupService = geoLookupService,
        botDetectionService = botDetectionService,
        urlVisitCounterService = urlVisitCounterService
    )
}
