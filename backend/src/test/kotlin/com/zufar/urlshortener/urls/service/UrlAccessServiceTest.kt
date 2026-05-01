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
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.security.access.AccessDeniedException
import java.time.Clock
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.Optional
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UrlAccessServiceTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var authenticatedUserContext: AuthenticatedUserContextService
    @Mock private lateinit var mongoTemplate: MongoTemplate

    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)
    private val service by lazy {
        UrlManagementService(
            urlRepository = urlRepository,
            urlValidator = mock(),
            authenticatedUserContext = authenticatedUserContext,
            urlMappingAccessService = UrlMappingAccessService(urlRepository, authenticatedUserContext, mongoTemplate, clock),
            baseUrl = "http://localhost:8080",
            defaultExpirationDays = 365,
            maxCodeGenerationAttempts = 10,
            maxPageSize = 100,
            clock = clock
        )
    }

    @Test
    fun `getActiveUrlMapping returns active mapping`() {
        val urlMapping = mapping(expirationDate = LocalDateTime.parse("2024-01-02T10:15:30"))
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(urlMapping))

        val result = service.getActiveUrlMapping("abc12345")

        assertEquals(urlMapping, result)
    }

    @Test
    fun `getActiveUrlMapping rejects expired mapping`() {
        val expiredMapping = mapping(expirationDate = LocalDateTime.parse("2023-12-31T10:15:30"))
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(expiredMapping))

        assertThrows<ApplicationException> {
            service.getActiveUrlMapping("abc12345")
        }
    }

    @Test
    fun `getOwnedActiveUrlMapping rejects access to mapping owned by another user`() {
        val urlMapping = mapping(userId = "another-user", expirationDate = LocalDateTime.parse("2024-01-02T10:15:30"))
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(urlMapping))
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")

        val exception = assertThrows<AccessDeniedException> {
            service.getOwnedActiveUrlMapping("abc12345", "forbidden")
        }

        assertEquals("forbidden", exception.message)
    }

    @Test
    fun `getOwnedActiveUrlMapping returns mapping for owner`() {
        val urlMapping = mapping(userId = "user-123", expirationDate = LocalDateTime.parse("2024-01-02T10:15:30"))
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(urlMapping))
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")

        val result = service.getOwnedActiveUrlMapping("abc12345", "forbidden")

        assertEquals(urlMapping, result)
    }

    private fun mapping(
        userId: String? = "user-123",
        expirationDate: LocalDateTime
    ) = UrlMapping(
        urlHash = "abc12345",
        shortUrl = "http://localhost:8080/abc12345",
        originalUrl = "https://example.com",
        clickCount = 0,
        createdAt = LocalDateTime.parse("2023-12-31T10:15:30"),
        expirationDate = expirationDate,
        requestIp = "127.0.0.1",
        userAgent = "JUnit",
        userId = userId
    )
}
