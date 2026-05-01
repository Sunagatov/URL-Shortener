package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.api.CurrentUserAccess
import com.zufar.urlshortener.urls.dto.ShortenUrlRequest
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import org.springframework.dao.DuplicateKeyException
import org.springframework.data.mongodb.core.MongoTemplate
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

@ExtendWith(MockitoExtension::class)
class UrlShortenerTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var urlValidator: UrlValidator
    @Mock private lateinit var currentUserAccess: CurrentUserAccess
    @Mock private lateinit var mongoTemplate: MongoTemplate
    @Mock private lateinit var httpRequest: HttpServletRequest
    private val baseUrl = "https://localhost:8080"
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    private fun createShortener(baseUrl: String = this.baseUrl) = UrlManagementService(
        urlRepository = urlRepository,
        urlValidator = urlValidator,
        currentUserAccess = currentUserAccess,
        mongoTemplate = mongoTemplate,
        baseUrl = baseUrl,
        defaultExpirationDays = 365,
        maxAllowedDaysCount = 365,
        maxCodeGenerationAttempts = 10,
        maxPageSize = 100,
        clock = clock
    )

    @Test
    fun `two different original URLs produce different short codes`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val urlShortener = createShortener()
        val shortUrl1 = urlShortener.shorten(ShortenUrlRequest("https://example.com", null), httpRequest)
        val shortUrl2 = urlShortener.shorten(ShortenUrlRequest("https://other.com", null), httpRequest)

        assertNotEquals(shortUrl1, shortUrl2, "Different URLs must produce different short codes")
    }

    @Test
    fun `same URL called twice creates two separate mappings without global deduplication`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val urlShortener = createShortener()
        urlShortener.shorten(ShortenUrlRequest("https://example.com", null), httpRequest)
        urlShortener.shorten(ShortenUrlRequest("https://example.com", null), httpRequest)

        verify(urlRepository, times(2)).insert(any<UrlMapping>())
        verify(urlRepository, never()).findByUrlHash(any())
    }

    @Test
    fun `insert collision retries and succeeds`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        var callCount = 0
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { invocation ->
            if (callCount++ < 1) {
                throw DuplicateKeyException("collision")
            }
            invocation.arguments[0]
        }

        val urlShortener = createShortener()
        val shortUrl = urlShortener.shorten(ShortenUrlRequest("https://example.com", null), httpRequest)

        assertTrue(shortUrl.startsWith("https://localhost:8080/"))
        verify(urlRepository, times(2)).insert(any<UrlMapping>())
        verify(urlRepository, never()).findByUrlHash(any())
    }

    @Test
    fun `shortenUrl throws when insert collisions exhaust all retries`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenThrow(DuplicateKeyException("collision"))

        val urlShortener = createShortener()
        assertThrows<IllegalStateException> {
            urlShortener.shorten(ShortenUrlRequest("https://example.com", null), httpRequest)
        }

        verify(urlRepository, times(10)).insert(any<UrlMapping>())
        verify(urlRepository, never()).findByUrlHash(any())
    }

    @Test
    fun `baseUrl trailing slash does not produce double slash`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val urlShortener = createShortener("https://localhost:8080/")
        val shortUrl = urlShortener.shorten(ShortenUrlRequest("https://example.com", null), httpRequest)

        assertTrue(shortUrl.startsWith("https://localhost:8080/"))
        assertTrue(!shortUrl.removePrefix("https://localhost:8080").contains("//"))
    }
}
