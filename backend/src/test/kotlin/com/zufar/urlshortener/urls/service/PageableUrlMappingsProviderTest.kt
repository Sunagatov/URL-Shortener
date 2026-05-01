package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.api.AuthenticatedUserContext
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.mongodb.core.MongoTemplate
import java.time.Clock
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset

@ExtendWith(MockitoExtension::class)
class PageableUrlMappingsProviderTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var authenticatedUserContext: AuthenticatedUserContext
    @Mock private lateinit var mongoTemplate: MongoTemplate
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)
    private val provider by lazy {
        UrlManagementService(
            urlRepository = urlRepository,
            urlValidator = mock(),
            authenticatedUserContext = authenticatedUserContext,
            mongoTemplate = mongoTemplate,
            baseUrl = "https://localhost:8080",
            defaultExpirationDays = 365,
            maxCodeGenerationAttempts = 10,
            maxPageSize = 100,
            clock = clock
        )
    }

    private fun mapping(urlHash: String, expiration: LocalDateTime) = UrlMapping(
        urlHash = urlHash,
        shortUrl = "https://localhost:8080/$urlHash",
        originalUrl = "https://example.com/$urlHash",
        clickCount = 0,
        createdAt = LocalDateTime.now().minusDays(1),
        expirationDate = expiration,
        requestIp = "127.0.0.1",
        userAgent = null,
        userId = "user-123"
    )

    @Test
    fun `getUrlMappingsPage returns only active non-expired mappings`() {
        val hashes = listOf("abc11111", "abc22222")
        val pageable = PageRequest.of(0, 10)
        val activeMappings = hashes.map { mapping(it, LocalDateTime.now().plusDays(10)) }

        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")
        whenever(urlRepository.findAllByUserIdAndExpirationDateAfter(eq("user-123"), any(), eq(pageable)))
            .thenReturn(PageImpl(activeMappings))

        val result = provider.getUserUrlMappings(0, 10)

        assertEquals(2, result.content.size)
        assertEquals(hashes, result.content.map { it.urlHash })
    }

    @Test
    fun `getUrlMappingsPage does not return expired mappings`() {
        val pageable = PageRequest.of(0, 10)

        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")
        whenever(urlRepository.findAllByUserIdAndExpirationDateAfter(eq("user-123"), any(), eq(pageable)))
            .thenReturn(PageImpl(emptyList()))

        val result = provider.getUserUrlMappings(0, 10)

        assertTrue(result.content.isEmpty(), "Expired mappings must not appear in active listing")
        assertEquals(0, result.totalElements)
    }

    @Test
    fun `getUrlMappingsPage passes correct pagination parameters`() {
        val pageable = PageRequest.of(2, 5)

        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("user-123")
        whenever(urlRepository.findAllByUserIdAndExpirationDateAfter(eq("user-123"), any(), eq(pageable)))
            .thenReturn(PageImpl(emptyList(), pageable, 0))

        val result = provider.getUserUrlMappings(2, 5)

        assertEquals(2, result.page)
        assertEquals(5, result.size)
    }
}
