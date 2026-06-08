package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.security.AuditLogService
import com.zufar.urlshortener.urls.config.UrlProtectionProperties
import com.zufar.urlshortener.urls.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import java.time.Instant
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UrlCreationProtectionServiceTest {
    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var clientIpResolver: ClientIpResolver
    @Mock private lateinit var request: HttpServletRequest
    private val now = Instant.parse("2024-01-01T10:15:30Z")

    @Test
    fun `prepareCreation returns anonymous hashed IP creator key and interstitial`() {
        whenever(clientIpResolver.resolve(request)).thenReturn("127.0.0.1")

        val result = service().prepareCreation("https://example.com", null, request, now)

        assertEquals(true, result.safetyInterstitialRequired)
        assertEquals("anonymous_creator", result.safetyInterstitialReason)
        assertEquals("127.0.0.1", result.clientIp)
        assertEquals(true, result.creatorKey.startsWith("ip:"))
    }

    @Test
    fun `prepareCreation returns user creator key without anonymous interstitial`() {
        whenever(clientIpResolver.resolve(request)).thenReturn("127.0.0.1")

        val result = service().prepareCreation("https://example.com", "user-123", request, now)

        assertEquals("user:user-123", result.creatorKey)
        assertEquals(false, result.safetyInterstitialRequired)
    }

    @Test
    fun `prepareCreation requires interstitial for IP literal destinations`() {
        whenever(clientIpResolver.resolve(request)).thenReturn("127.0.0.1")

        val result = service().prepareCreation("https://192.0.2.10/login", "user-123", request, now)

        assertEquals(true, result.safetyInterstitialRequired)
        assertEquals("ip_destination", result.safetyInterstitialReason)
    }

    @Test
    fun `prepareCreation requires interstitial for insecure http destinations`() {
        whenever(clientIpResolver.resolve(request)).thenReturn("127.0.0.1")

        val result = service().prepareCreation("http://example.com/login", "user-123", request, now)

        assertEquals(true, result.safetyInterstitialRequired)
        assertEquals("http_destination", result.safetyInterstitialReason)
    }

    @Test
    fun `prepareCreation does not require http interstitial when disabled`() {
        whenever(clientIpResolver.resolve(request)).thenReturn("127.0.0.1")

        val result = service(
            UrlProtectionProperties(safetyInterstitialForHttpDestinations = false)
        ).prepareCreation("http://example.com/login", "user-123", request, now)

        assertEquals(false, result.safetyInterstitialRequired)
    }

    @Test
    fun `prepareCreation prioritizes IP destination reason over anonymous creator reason`() {
        whenever(clientIpResolver.resolve(request)).thenReturn("127.0.0.1")

        val result = service().prepareCreation("https://[2001:db8::1]/login", null, request, now)

        assertEquals(true, result.safetyInterstitialRequired)
        assertEquals("ip_destination", result.safetyInterstitialReason)
    }

    @Test
    fun `prepareCreation blocks when quota is reached`() {
        whenever(clientIpResolver.resolve(request)).thenReturn("127.0.0.1")
        whenever(urlRepository.countByCreatorKeyAndCreatedAtAfter(any(), any())).thenReturn(25)

        val ex = assertThrows<ApplicationException> {
            service().prepareCreation("https://example.com", null, request, now)
        }

        assertEquals("URL_DAILY_QUOTA_EXCEEDED", ex.code)
    }

    @Test
    fun `prepareCreation blocks when destination host quota is reached`() {
        whenever(clientIpResolver.resolve(request)).thenReturn("127.0.0.1")
        whenever(urlRepository.countByTargetHostAndCreatedAtAfter("example.com", now.minus(1, java.time.temporal.ChronoUnit.DAYS)))
            .thenReturn(2)

        val ex = assertThrows<ApplicationException> {
            service(UrlProtectionProperties(destinationHostDailyQuota = 2))
                .prepareCreation("https://example.com/path", "user-123", request, now)
        }

        assertEquals("URL_DESTINATION_QUOTA_EXCEEDED", ex.code)
    }

    @Test
    fun `prepareCreation requires interstitial for suspicious destination host`() {
        whenever(clientIpResolver.resolve(request)).thenReturn("127.0.0.1")

        val result = service().prepareCreation("https://secure-login.example.zip", "user-123", request, now)

        assertEquals(true, result.safetyInterstitialRequired)
        assertEquals("suspicious_destination", result.safetyInterstitialReason)
    }

    private fun service(
        properties: UrlProtectionProperties = UrlProtectionProperties()
    ) = UrlCreationProtectionService(
        urlRepository = urlRepository,
        clientIpResolver = clientIpResolver,
        protectionProperties = properties,
        auditLogService = AuditLogService()
    )
}
