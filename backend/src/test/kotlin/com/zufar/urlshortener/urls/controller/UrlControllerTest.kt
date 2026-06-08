package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.dto.UrlMappingPageDto
import com.zufar.urlshortener.urls.dto.ShortenUrlRequest
import com.zufar.urlshortener.urls.dto.UrlResponse
import com.zufar.urlshortener.shared.turnstile.TurnstileProperties
import com.zufar.urlshortener.shared.turnstile.TurnstileVerifier
import com.zufar.urlshortener.urls.service.UrlManagementService
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import java.time.Instant
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UrlControllerTest {

    @Mock private lateinit var urlManagementService: UrlManagementService
    @Mock private lateinit var turnstileVerifier: TurnstileVerifier
    @Mock private lateinit var request: HttpServletRequest

    private fun controller(
        defaultPage: Int = 0,
        defaultSize: Int = 10,
        urlCreateTurnstileEnabled: Boolean = false
    ) = UrlController(
        urlManagementService = urlManagementService,
        turnstileVerifier = turnstileVerifier,
        turnstileProperties = TurnstileProperties(
            enabled = urlCreateTurnstileEnabled,
            urlCreateEnabled = urlCreateTurnstileEnabled,
            secretKey = if (urlCreateTurnstileEnabled) "test-secret" else ""
        ),
        defaultPage = defaultPage,
        defaultSize = defaultSize
    )

    @Test
    fun `shortenUrl delegates without Turnstile when protection is disabled`() {
        val controller = controller()
        val shortenRequest = ShortenUrlRequest(
            originalUrl = "https://example.com",
            daysCount = 7,
            turnstileToken = "unused-token"
        )
        whenever(urlManagementService.shorten(shortenRequest, request)).thenReturn("http://localhost:8080/abc12345")

        val response = controller.shortenUrl(shortenRequest, request)

        verifyNoInteractions(turnstileVerifier)
        verify(urlManagementService).shorten(shortenRequest, request)
        assertEquals(UrlResponse("http://localhost:8080/abc12345"), response.body)
    }

    @Test
    fun `shortenUrl verifies Turnstile token when create protection is enabled`() {
        val controller = controller(urlCreateTurnstileEnabled = true)
        val shortenRequest = ShortenUrlRequest(
            originalUrl = "https://example.com",
            daysCount = 7,
            turnstileToken = "turnstile-token"
        )
        whenever(urlManagementService.shorten(shortenRequest, request)).thenReturn("http://localhost:8080/abc12345")

        val response = controller.shortenUrl(shortenRequest, request)

        verify(turnstileVerifier).verify("turnstile-token", setOf("url_create"))
        verify(urlManagementService).shorten(shortenRequest, request)
        assertEquals(UrlResponse("http://localhost:8080/abc12345"), response.body)
    }

    @Test
    fun `getUserUrlMappings delegates for pagination`() {
        val controller = controller()
        val page = UrlMappingPageDto(
            content = emptyList(),
            page = 0,
            size = 10,
            totalElements = 0,
            totalPages = 0
        )
        whenever(urlManagementService.getUserUrlMappings(0, 10)).thenReturn(page)

        val response = controller.getUserUrlMappings(page = 0, size = 10)

        verify(urlManagementService).getUserUrlMappings(0, 10)
        assertEquals(page, response.body)
    }

    @Test
    fun `getUrlMappingByHash delegates to url service`() {
        val controller = controller()
        val urlMapping = UrlMappingDto(
            urlHash = "abc12345",
            shortUrl = "http://localhost:8080/abc12345",
            originalUrl = "https://example.com",
            clickCount = 0,
            qrScanCount = 0,
            createdAt = Instant.parse("2024-01-01T10:15:30Z"),
            expirationDate = Instant.parse("2024-01-02T10:15:30Z")
        )
        whenever(urlManagementService.getOwnedUrlMapping("abc12345")).thenReturn(urlMapping)

        val response = controller.getUrlMappingByHash("abc12345")

        verify(urlManagementService).getOwnedUrlMapping("abc12345")
        assertEquals(urlMapping, response.body)
    }

    @Test
    fun `deleteUrlMapping delegates to url service`() {
        val controller = controller()

        val response = controller.deleteUrlMapping("abc12345")

        verify(urlManagementService).delete("abc12345")
        assertEquals(204, response.statusCode.value())
    }
}
