package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.analytics.entity.EventType
import com.zufar.urlshortener.analytics.entity.SourceType
import com.zufar.urlshortener.analytics.entity.TrackUrlVisitCommand
import com.zufar.urlshortener.analytics.service.TrackUrlVisitService
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.service.UrlManagementService
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@ExtendWith(MockitoExtension::class)
class UrlRedirectEdgeCasesTest {

    @Mock private lateinit var urlManagementService: UrlManagementService
    @Mock private lateinit var trackUrlVisitService: TrackUrlVisitService
    @Mock private lateinit var clientIpResolver: ClientIpResolver
    @Mock private lateinit var httpRequest: HttpServletRequest
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    private fun controller(maxCacheSeconds: Long = 3600) = UrlRedirectController(
        urlManagementService = urlManagementService,
        trackUrlVisitService = trackUrlVisitService,
        clientIpResolver = clientIpResolver,
        maxRedirectCacheSeconds = maxCacheSeconds,
        clock = clock
    )

    @Test
    fun `redirect tracks QR scan when qr parameter is present`() {
        val mapping = activeMapping()
        whenever(urlManagementService.getActiveUrlMapping("abc12345")).thenReturn(mapping)
        whenever(clientIpResolver.resolve(httpRequest)).thenReturn("10.0.0.1")

        controller().redirect("abc12345", "true", httpRequest)

        val captor = argumentCaptor<TrackUrlVisitCommand>()
        verify(trackUrlVisitService).trackAsync(captor.capture())
        assertEquals(SourceType.QR, captor.firstValue.sourceType)
        assertEquals(EventType.QR_SCAN, captor.firstValue.eventType)
    }

    @Test
    fun `redirect tracks link click when qr parameter is absent`() {
        val mapping = activeMapping()
        whenever(urlManagementService.getActiveUrlMapping("abc12345")).thenReturn(mapping)
        whenever(clientIpResolver.resolve(httpRequest)).thenReturn("10.0.0.1")

        controller().redirect("abc12345", null, httpRequest)

        val captor = argumentCaptor<TrackUrlVisitCommand>()
        verify(trackUrlVisitService).trackAsync(captor.capture())
        assertEquals(SourceType.REDIRECT, captor.firstValue.sourceType)
        assertEquals(EventType.LINK_CLICK, captor.firstValue.eventType)
    }

    @Test
    fun `redirect returns 302 with Location header`() {
        val mapping = activeMapping()
        whenever(urlManagementService.getActiveUrlMapping("abc12345")).thenReturn(mapping)
        whenever(clientIpResolver.resolve(httpRequest)).thenReturn("10.0.0.1")

        val response = controller().redirect("abc12345", null, httpRequest)

        assertEquals(302, response.statusCode.value())
        assertEquals("https://example.com", response.headers.location.toString())
    }

    @Test
    fun `redirect includes Referrer-Policy header`() {
        val mapping = activeMapping()
        whenever(urlManagementService.getActiveUrlMapping("abc12345")).thenReturn(mapping)
        whenever(clientIpResolver.resolve(httpRequest)).thenReturn("10.0.0.1")

        val response = controller().redirect("abc12345", null, httpRequest)

        assertEquals("no-referrer", response.headers.getFirst("Referrer-Policy"))
    }

    @Test
    fun `redirect includes Cache-Control with public directive`() {
        val mapping = activeMapping()
        whenever(urlManagementService.getActiveUrlMapping("abc12345")).thenReturn(mapping)
        whenever(clientIpResolver.resolve(httpRequest)).thenReturn("10.0.0.1")

        val response = controller().redirect("abc12345", null, httpRequest)

        val cacheControl = response.headers.cacheControl
        assertTrue(cacheControl!!.contains("public"))
    }

    @Test
    fun `redirect caps Cache-Control at maxRedirectCacheSeconds`() {
        // Mapping expires far in the future, but max cache is 60 seconds
        val mapping = activeMapping(expirationDate = Instant.parse("2025-01-01T10:15:30Z"))
        whenever(urlManagementService.getActiveUrlMapping("abc12345")).thenReturn(mapping)
        whenever(clientIpResolver.resolve(httpRequest)).thenReturn("10.0.0.1")

        val response = controller(maxCacheSeconds = 60).redirect("abc12345", null, httpRequest)

        val cacheControl = response.headers.cacheControl!!
        assertTrue(cacheControl.contains("max-age=60"))
    }

    @Test
    fun `redirect returns no-store for URL expiring in the past`() {
        // Mapping that just expired (edge case: getActiveUrlMapping still returned it)
        val mapping = activeMapping(expirationDate = Instant.parse("2024-01-01T10:15:29Z"))
        whenever(urlManagementService.getActiveUrlMapping("abc12345")).thenReturn(mapping)
        whenever(clientIpResolver.resolve(httpRequest)).thenReturn("10.0.0.1")

        val response = controller().redirect("abc12345", null, httpRequest)

        val cacheControl = response.headers.cacheControl!!
        assertTrue(cacheControl.contains("no-store"))
    }

    @Test
    fun `redirect passes correct urlHash and userId in analytics command`() {
        val mapping = activeMapping()
        whenever(urlManagementService.getActiveUrlMapping("abc12345")).thenReturn(mapping)
        whenever(clientIpResolver.resolve(httpRequest)).thenReturn("10.0.0.1")
        whenever(httpRequest.getHeader("Referer")).thenReturn("https://twitter.com")
        whenever(httpRequest.getHeader("User-Agent")).thenReturn("Mozilla/5.0")

        controller().redirect("abc12345", null, httpRequest)

        val captor = argumentCaptor<TrackUrlVisitCommand>()
        verify(trackUrlVisitService).trackAsync(captor.capture())
        assertEquals("abc12345", captor.firstValue.urlHash)
        assertEquals("user-123", captor.firstValue.userId)
        assertEquals("https://twitter.com", captor.firstValue.referer)
        assertEquals("Mozilla/5.0", captor.firstValue.userAgent)
    }

    private fun activeMapping(expirationDate: Instant = Instant.parse("2024-06-01T10:15:30Z")) = UrlMapping(
        urlHash = "abc12345",
        shortUrl = "https://localhost:8080/abc12345",
        originalUrl = "https://example.com",
        clickCount = 0,
        createdAt = Instant.parse("2023-12-31T10:15:30Z"),
        expirationDate = expirationDate,
        requestIp = "127.0.0.1",
        userAgent = "JUnit",
        userId = "user-123"
    )
}
