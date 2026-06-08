package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class UrlDeleterTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var authenticatedUserContext: AuthenticatedUserContextService
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    @Test
    fun `deleteUrl deletes owned mapping`() {
        val urlMapping = UrlMapping(
            urlHash = "abc12345",
            shortUrl = "http://localhost:8080/abc12345",
            originalUrl = "https://example.com",
            clickCount = 0,
            createdAt = Instant.parse("2023-12-31T10:15:30Z"),
            expirationDate = Instant.parse("2024-01-02T10:15:30Z"),
            requestIp = "127.0.0.1",
            userAgent = "JUnit",
            userId = "user-123"
        )
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(urlMapping))
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")

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
        ).delete("abc12345")

        verify(urlRepository).deleteById("abc12345")
    }
}
