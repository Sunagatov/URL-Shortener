package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.security.access.AccessDeniedException
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.Optional
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UrlAccessServiceTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var authenticatedUserContext: AuthenticatedUserContextService

    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)
    private val service by lazy {
        UrlManagementService(
            urlRepository = urlRepository,
            urlValidator = mock(),
            authenticatedUserContext = authenticatedUserContext,
            urlMappingAccessService = UrlMappingAccessService(urlRepository, authenticatedUserContext, clock),
            urlCreationProtectionService = testUrlCreationProtectionService(urlRepository),
            auditLogService = testAuditLogService(),
            baseUrl = "http://localhost:8080",
            defaultExpirationDays = 365,
            maxCodeGenerationAttempts = 10,
            maxPageSize = 100,
            clock = clock
        )
    }

    @Test
    fun `getActiveUrlMapping returns active mapping`() {
        val urlMapping = mapping(expirationDate = Instant.parse("2024-01-02T10:15:30Z"))
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(urlMapping))

        val result = service.getActiveUrlMapping("abc12345")

        assertEquals(urlMapping, result)
    }

    @Test
    fun `getActiveUrlMapping rejects expired mapping`() {
        val expiredMapping = mapping(expirationDate = Instant.parse("2023-12-31T10:15:30Z"))
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(expiredMapping))

        assertThrows<ApplicationException> {
            service.getActiveUrlMapping("abc12345")
        }
    }

    @Test
    fun `getActiveUrlMapping rejects disabled mapping`() {
        val disabledMapping = mapping(
            expirationDate = Instant.parse("2024-01-02T10:15:30Z"),
            disabled = true
        )
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(disabledMapping))

        assertThrows<ApplicationException> {
            service.getActiveUrlMapping("abc12345")
        }
    }

    @Test
    fun `getOwnedActiveUrlMapping rejects access to mapping owned by another user`() {
        val urlMapping = mapping(userId = "another-user", expirationDate = Instant.parse("2024-01-02T10:15:30Z"))
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(urlMapping))
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")

        val exception = assertThrows<AccessDeniedException> {
            service.getOwnedActiveUrlMapping("abc12345", "forbidden")
        }

        assertEquals("forbidden", exception.message)
    }

    @Test
    fun `getOwnedActiveUrlMapping returns mapping for owner`() {
        val urlMapping = mapping(userId = "user-123", expirationDate = Instant.parse("2024-01-02T10:15:30Z"))
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(urlMapping))
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")

        val result = service.getOwnedActiveUrlMapping("abc12345", "forbidden")

        assertEquals(urlMapping, result)
    }

    private fun mapping(
        userId: String? = "user-123",
        expirationDate: Instant,
        disabled: Boolean = false
    ) = UrlMapping(
        urlHash = "abc12345",
        shortUrl = "http://localhost:8080/abc12345",
        originalUrl = "https://example.com",
        clickCount = 0,
        createdAt = Instant.parse("2023-12-31T10:15:30Z"),
        expirationDate = expirationDate,
        requestIp = "127.0.0.1",
        userAgent = "JUnit",
        userId = userId,
        disabled = disabled,
        disabledReason = if (disabled) "abuse" else null,
        disabledAt = if (disabled) Instant.parse("2024-01-01T10:00:00Z") else null
    )
}
