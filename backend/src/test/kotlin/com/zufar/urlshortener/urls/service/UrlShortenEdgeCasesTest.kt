package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.urls.dto.ShortenUrlRequest
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UrlShortenEdgeCasesTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var urlValidator: UrlValidator
    @Mock private lateinit var authenticatedUserContext: AuthenticatedUserContextService
    @Mock private lateinit var httpRequest: HttpServletRequest
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    private fun service(defaultDays: Long = 365) = UrlManagementService(
        urlRepository = urlRepository,
        urlValidator = urlValidator,
        authenticatedUserContext = authenticatedUserContext,
        urlMappingAccessService = UrlMappingAccessService(urlRepository, authenticatedUserContext, clock),
        baseUrl = "https://localhost:8080",
        defaultExpirationDays = defaultDays,
        maxCodeGenerationAttempts = 10,
        maxPageSize = 100,
        clock = clock
    )

    @Test
    fun `null daysCount defaults to configured default`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        service(defaultDays = 365).shorten(ShortenUrlRequest("https://example.com", null), httpRequest)

        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).insert(captor.capture())
        assertEquals(Instant.parse("2024-12-31T10:15:30Z"), captor.firstValue.expirationDate)
    }

    @Test
    fun `daysCount of 1 sets expiration to tomorrow`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        service().shorten(ShortenUrlRequest("https://example.com", 1), httpRequest)

        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).insert(captor.capture())
        assertEquals(Instant.parse("2024-01-02T10:15:30Z"), captor.firstValue.expirationDate)
    }

    @Test
    fun `daysCount of 365 sets expiration to one year`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        service().shorten(ShortenUrlRequest("https://example.com", 365), httpRequest)

        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).insert(captor.capture())
        assertEquals(Instant.parse("2024-12-31T10:15:30Z"), captor.firstValue.expirationDate)
    }

    @Test
    fun `shorten trims whitespace from URL`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        service().shorten(ShortenUrlRequest("  https://example.com  ", null), httpRequest)

        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).insert(captor.capture())
        assertEquals("https://example.com", captor.firstValue.originalUrl)
    }

    @Test
    fun `shorten associates userId for authenticated user`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(authenticatedUserContext.findAuthenticatedUserIdOrNull()).thenReturn("user-123")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        service().shorten(ShortenUrlRequest("https://example.com", null), httpRequest)

        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).insert(captor.capture())
        assertEquals("user-123", captor.firstValue.userId)
    }

    @Test
    fun `shorten sets null userId for anonymous user`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(authenticatedUserContext.findAuthenticatedUserIdOrNull()).thenReturn(null)
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        service().shorten(ShortenUrlRequest("https://example.com", null), httpRequest)

        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).insert(captor.capture())
        assertEquals(null, captor.firstValue.userId)
    }

    @Test
    fun `shorten stores hashed creator metadata instead of raw client metadata`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(httpRequest.getHeader("X-Forwarded-For")).thenReturn(null)
        whenever(httpRequest.getHeader("User-Agent")).thenReturn("JUnit")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        service().shorten(ShortenUrlRequest("https://example.com", null), httpRequest)

        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).insert(captor.capture())
        assertEquals(null, captor.firstValue.requestIp)
        assertEquals(null, captor.firstValue.userAgent)
        assertEquals(64, captor.firstValue.requestIpHash?.length)
        assertEquals(64, captor.firstValue.userAgentHash?.length)
        assertEquals("ip:${captor.firstValue.requestIpHash}", captor.firstValue.creatorKey)
    }

    @Test
    fun `shorten blocks anonymous creator after daily quota is reached`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.countByCreatorKeyAndCreatedAtAfter(any(), any())).thenReturn(25)

        val ex = assertThrows<ApplicationException> {
            service().shorten(ShortenUrlRequest("https://example.com", null), httpRequest)
        }

        assertEquals("URL_DAILY_QUOTA_EXCEEDED", ex.code)
    }

    @Test
    fun `anonymous links require safety interstitial by default`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        service().shorten(ShortenUrlRequest("https://example.com", null), httpRequest)

        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).insert(captor.capture())
        assertEquals(true, captor.firstValue.safetyInterstitialRequired)
        assertEquals("anonymous_creator", captor.firstValue.safetyInterstitialReason)
    }

    @Test
    fun `authenticated links use user quota and skip anonymous safety interstitial`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(authenticatedUserContext.findAuthenticatedUserIdOrNull()).thenReturn("user-123")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        service().shorten(ShortenUrlRequest("https://example.com", null), httpRequest)

        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).insert(captor.capture())
        assertEquals("user:user-123", captor.firstValue.creatorKey)
        assertEquals(false, captor.firstValue.safetyInterstitialRequired)
    }

    @Test
    fun `getUserUrlMappings rejects negative page`() {
        val ex = assertThrows<ApplicationException> { service().getUserUrlMappings(-1, 10) }
        assertEquals("INVALID_URL_REQUEST", ex.code)
    }

    @Test
    fun `getUserUrlMappings rejects size exceeding max`() {
        val ex = assertThrows<ApplicationException> { service().getUserUrlMappings(0, 101) }
        assertEquals("INVALID_URL_REQUEST", ex.code)
    }

    @Test
    fun `getUserUrlMappings rejects size of zero`() {
        val ex = assertThrows<ApplicationException> { service().getUserUrlMappings(0, 0) }
        assertEquals("INVALID_URL_REQUEST", ex.code)
    }

    @Test
    fun `getUserUrlMappings accepts max page size`() {
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")
        whenever(urlRepository.findAllByUserIdAndExpirationDateAfter(any(), any(), any()))
            .thenReturn(PageImpl(emptyList(), PageRequest.of(0, 100), 0))

        val result = service().getUserUrlMappings(0, 100)
        assertEquals(0, result.totalElements)
    }
}
