package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.Optional
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UrlMappingProviderTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var authenticatedUserContext: AuthenticatedUserContextService
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    @Test
    fun `getPublicUrlMappingByHash maps active url mapping`() {
        val urlMapping = mapping()
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(urlMapping))

        val result = service().getPublicUrlMapping("abc12345")

        assertEquals(UrlMappingDto.fromEntity(urlMapping), result)
    }

    @Test
    fun `getOwnedUrlMappingByHash delegates ownership lookup`() {
        val urlMapping = mapping()
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(urlMapping))
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")

        val result = service().getOwnedUrlMapping("abc12345")

        assertEquals(UrlMappingDto.fromEntity(urlMapping), result)
    }

    private fun service() = UrlManagementService(
        urlRepository = urlRepository,
        urlValidator = mock(),
        authenticatedUserContext = authenticatedUserContext,
        urlMappingAccessService = UrlMappingAccessService(urlRepository, authenticatedUserContext, clock),
        baseUrl = "http://localhost:8080",
        defaultExpirationDays = 365,
        maxCodeGenerationAttempts = 10,
        maxPageSize = 100,
        clock = clock
    )

    private fun mapping() = UrlMapping(
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
}
