package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.entity.UserDetails
import com.zufar.urlshortener.auth.service.CurrentUserProvider
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
import org.mockito.kotlin.whenever
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.time.Clock
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset

@ExtendWith(MockitoExtension::class)
class PageableUrlMappingsProviderTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var currentUserProvider: CurrentUserProvider
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)
    private val provider by lazy { PageableUrlMappingsProvider(urlRepository, currentUserProvider, clock) }

    private val testUser = UserDetails(
        id = "user-123",
        firstName = "Test",
        lastName = "User",
        email = "test@example.com",
        password = "hashed",
        country = "US",
        age = 25
    )

    private fun mapping(urlHash: String, expiration: LocalDateTime) = UrlMapping(
        urlHash = urlHash,
        shortUrl = "http://localhost:8080/$urlHash",
        originalUrl = "http://example.com/$urlHash",
        createdAt = LocalDateTime.now().minusDays(1),
        expirationDate = expiration,
        requestIp = "127.0.0.1",
        userAgent = null,
        userId = testUser.id
    )

    @Test
    fun `getUrlMappingsPage returns only active non-expired mappings`() {
        val hashes = listOf("abc11111", "abc22222")
        val pageable = PageRequest.of(0, 10)
        val activeMappings = hashes.map { mapping(it, LocalDateTime.now().plusDays(10)) }

        whenever(currentUserProvider.requireCurrentUserId()).thenReturn("user-123")
        whenever(urlRepository.findAllByUserIdAndExpirationDateAfter(eq("user-123"), any(), eq(pageable)))
            .thenReturn(PageImpl(activeMappings))

        val result = provider.getUrlMappingsPage(0, 10)

        assertEquals(2, result.content.size)
        assertEquals(hashes, result.content.map { it.urlHash })
    }

    @Test
    fun `getUrlMappingsPage does not return expired mappings`() {
        val pageable = PageRequest.of(0, 10)

        whenever(currentUserProvider.requireCurrentUserId()).thenReturn("user-123")
        whenever(urlRepository.findAllByUserIdAndExpirationDateAfter(eq("user-123"), any(), eq(pageable)))
            .thenReturn(PageImpl(emptyList()))

        val result = provider.getUrlMappingsPage(0, 10)

        assertTrue(result.content.isEmpty(), "Expired mappings must not appear in active listing")
        assertEquals(0, result.totalElements)
    }

    @Test
    fun `getUrlMappingsPage passes correct pagination parameters`() {
        val pageable = PageRequest.of(2, 5)

        whenever(currentUserProvider.requireCurrentUserId()).thenReturn("user-123")
        whenever(urlRepository.findAllByUserIdAndExpirationDateAfter(eq("user-123"), any(), eq(pageable)))
            .thenReturn(PageImpl(emptyList(), pageable, 0))

        val result = provider.getUrlMappingsPage(2, 5)

        assertEquals(2, result.page)
        assertEquals(5, result.size)
    }
}
