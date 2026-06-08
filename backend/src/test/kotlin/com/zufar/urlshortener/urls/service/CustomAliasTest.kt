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
import org.mockito.kotlin.whenever
import org.springframework.dao.DuplicateKeyException
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@ExtendWith(MockitoExtension::class)
class CustomAliasTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var urlValidator: UrlValidator
    @Mock private lateinit var authenticatedUserContext: AuthenticatedUserContextService
    @Mock private lateinit var httpRequest: HttpServletRequest
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    private fun service() = UrlManagementService(
        urlRepository = urlRepository,
        urlValidator = urlValidator,
        authenticatedUserContext = authenticatedUserContext,
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
    fun `custom alias creates mapping with alias as urlHash`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val shortUrl = service().shorten(ShortenUrlRequest("https://example.com", null, "my-link"), httpRequest)

        assertEquals("https://localhost:8080/my-link", shortUrl)
        val captor = argumentCaptor<UrlMapping>()
        org.mockito.kotlin.verify(urlRepository).insert(captor.capture())
        assertEquals("my-link", captor.firstValue.urlHash)
    }

    @Test
    fun `custom alias rejects invalid characters`() {
        val ex = assertThrows<ApplicationException> {
            service().shorten(ShortenUrlRequest("https://example.com", null, "my link!"), httpRequest)
        }
        assertEquals("INVALID_URL_REQUEST", ex.code)
    }

    @Test
    fun `custom alias rejects reserved aliases`() {
        val ex = assertThrows<ApplicationException> {
            service().shorten(ShortenUrlRequest("https://example.com", null, "admin"), httpRequest)
        }
        assertEquals("ALIAS_RESERVED", ex.code)
    }

    @Test
    fun `custom alias rejects reserved aliases case-insensitively`() {
        val ex = assertThrows<ApplicationException> {
            service().shorten(ShortenUrlRequest("https://example.com", null, "SignIn"), httpRequest)
        }
        assertEquals("ALIAS_RESERVED", ex.code)
    }

    @Test
    fun `custom alias conflict returns ALIAS_TAKEN`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenThrow(DuplicateKeyException("dup"))

        val ex = assertThrows<ApplicationException> {
            service().shorten(ShortenUrlRequest("https://example.com", null, "taken-alias"), httpRequest)
        }
        assertEquals("ALIAS_TAKEN", ex.code)
        assertTrue(ex.message.contains("taken-alias"))
    }

    @Test
    fun `custom alias trims whitespace`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val shortUrl = service().shorten(ShortenUrlRequest("https://example.com", null, "  my-link  "), httpRequest)

        assertEquals("https://localhost:8080/my-link", shortUrl)
    }
}
