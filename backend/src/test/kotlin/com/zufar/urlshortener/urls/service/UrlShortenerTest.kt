package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.user.CurrentUserService
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
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.dao.DuplicateKeyException
import org.springframework.data.mongodb.core.MongoTemplate
import java.time.Clock
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

@ExtendWith(MockitoExtension::class)
class UrlShortenerTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock @Suppress("unused") private lateinit var urlValidator: UrlValidator
    @Mock @Suppress("unused") private lateinit var daysCountValidator: DaysCountValidator
    @Mock private lateinit var currentUserService: CurrentUserService
    @Mock private lateinit var mongoTemplate: MongoTemplate
    @Mock private lateinit var httpRequest: HttpServletRequest
    private val baseUrl = "http://localhost:8080"
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    private fun createShortener(baseUrl: String = this.baseUrl) = UrlManagementService(
        urlRepository = urlRepository,
        urlValidator = urlValidator,
        daysCountValidator = daysCountValidator,
        currentUserService = currentUserService,
        mongoTemplate = mongoTemplate,
        baseUrl = baseUrl,
        clock = clock
    )

    @Test
    fun `two different original URLs produce different short codes`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val urlShortener = createShortener()
        val shortUrl1 = urlShortener.shorten(ShortenUrlRequest("http://example.com", null), httpRequest)
        val shortUrl2 = urlShortener.shorten(ShortenUrlRequest("http://other.com", null), httpRequest)

        assertNotEquals(shortUrl1, shortUrl2, "Different URLs must produce different short codes")
    }

    @Test
    fun `same URL called twice creates two separate mappings without global deduplication`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val urlShortener = createShortener()
        urlShortener.shorten(ShortenUrlRequest("http://example.com", null), httpRequest)
        urlShortener.shorten(ShortenUrlRequest("http://example.com", null), httpRequest)

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
        val shortUrl = urlShortener.shorten(ShortenUrlRequest("http://example.com", null), httpRequest)

        assertTrue(shortUrl.startsWith("http://localhost:8080/"))
        verify(urlRepository, times(2)).insert(any<UrlMapping>())
        verify(urlRepository, never()).findByUrlHash(any())
    }

    @Test
    fun `shortenUrl throws when insert collisions exhaust all retries`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenThrow(DuplicateKeyException("collision"))

        val urlShortener = createShortener()
        assertThrows<IllegalStateException> {
            urlShortener.shorten(ShortenUrlRequest("http://example.com", null), httpRequest)
        }

        verify(urlRepository, times(10)).insert(any<UrlMapping>())
        verify(urlRepository, never()).findByUrlHash(any())
    }

    @Test
    fun `baseUrl trailing slash does not produce double slash`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val urlShortener = createShortener("http://localhost:8080/")
        val shortUrl = urlShortener.shorten(ShortenUrlRequest("http://example.com", null), httpRequest)

        assertTrue(shortUrl.startsWith("http://localhost:8080/"))
        assertTrue(!shortUrl.removePrefix("http://localhost:8080").contains("//"))
    }
}
