package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.security.access.AccessDeniedException
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.Optional
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UrlUpdateTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var urlValidator: UrlValidator
    @Mock private lateinit var authenticatedUserContext: AuthenticatedUserContextService
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    private fun service() = UrlManagementService(
        urlRepository = urlRepository,
        urlValidator = urlValidator,
        authenticatedUserIdProvider = authenticatedUserContext,
        urlMappingAccessService = UrlMappingAccessService(urlRepository, authenticatedUserContext, clock),
        urlCreationProtectionService = testUrlCreationProtectionService(urlRepository),
        auditLogService = testAuditLogService(),
        baseUrl = "https://localhost:8080",
        defaultExpirationDays = 365,
        maxCodeGenerationAttempts = 10,
        maxPageSize = 100,
        clock = clock
    )

    @Test
    fun `updateOriginalUrl saves new URL for owned mapping`() {
        val mapping = activeMapping()
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(mapping))
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")
        whenever(urlRepository.save(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val result = service().updateOriginalUrl("abc12345", "https://new-url.com")

        assertEquals("https://new-url.com", result.originalUrl)
        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).save(captor.capture())
        assertEquals("https://new-url.com", captor.firstValue.originalUrl)
    }

    @Test
    fun `updateOriginalUrl recomputes safety interstitial for risky destination`() {
        val mapping = activeMapping()
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(mapping))
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")
        whenever(urlRepository.save(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val result = service().updateOriginalUrl("abc12345", "https://93.184.216.34/login")

        assertEquals(true, result.safetyInterstitialRequired)
        assertEquals("ip_destination", result.safetyInterstitialReason)
        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).save(captor.capture())
        assertEquals(true, captor.firstValue.safetyInterstitialRequired)
        assertEquals("ip_destination", captor.firstValue.safetyInterstitialReason)
    }

    @Test
    fun `updateOriginalUrl clears stale safety interstitial for safe authenticated destination`() {
        val mapping = activeMapping().copy(
            safetyInterstitialRequired = true,
            safetyInterstitialReason = "ip_destination"
        )
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(mapping))
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")
        whenever(urlRepository.save(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val result = service().updateOriginalUrl("abc12345", "https://example.org")

        assertEquals(false, result.safetyInterstitialRequired)
        assertEquals(null, result.safetyInterstitialReason)
        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).save(captor.capture())
        assertEquals(false, captor.firstValue.safetyInterstitialRequired)
        assertEquals(null, captor.firstValue.safetyInterstitialReason)
    }

    @Test
    fun `updateOriginalUrl trims whitespace from new URL`() {
        val mapping = activeMapping()
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(mapping))
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")
        whenever(urlRepository.save(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val result = service().updateOriginalUrl("abc12345", "  https://new-url.com  ")

        assertEquals("https://new-url.com", result.originalUrl)
    }

    @Test
    fun `updateOriginalUrl rejects non-owner`() {
        val mapping = activeMapping()
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(mapping))
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("other-user")

        assertThrows<AccessDeniedException> {
            service().updateOriginalUrl("abc12345", "https://new-url.com")
        }
    }

    @Test
    fun `updateOriginalUrl validates new URL`() {
        whenever(urlValidator.validateUrl("https://evil.com")).thenThrow(IllegalArgumentException("blocked"))

        assertThrows<IllegalArgumentException> {
            service().updateOriginalUrl("abc12345", "https://evil.com")
        }
    }

    private fun activeMapping() = UrlMapping(
        urlHash = "abc12345",
        shortUrl = "https://localhost:8080/abc12345",
        originalUrl = "https://example.com",
        clickCount = 0,
        createdAt = Instant.parse("2023-12-31T10:15:30Z"),
        expirationDate = Instant.parse("2024-06-01T10:15:30Z"),
        requestIp = "127.0.0.1",
        userAgent = "JUnit",
        userId = "user-123"
    )
}
