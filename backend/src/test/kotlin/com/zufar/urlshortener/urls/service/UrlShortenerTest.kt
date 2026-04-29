package com.zufar.urlshortener.urls.service

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
import java.time.LocalDateTime
import kotlin.test.assertTrue
import kotlin.test.assertNotEquals

@ExtendWith(MockitoExtension::class)
class UrlShortenerTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock @Suppress("unused") private lateinit var urlValidator: UrlValidator
    @Mock @Suppress("unused") private lateinit var daysCountValidator: DaysCountValidator
    @Mock private lateinit var urlMappingEntityCreator: UrlMappingEntityCreator
    @Mock private lateinit var httpRequest: HttpServletRequest
    private val baseUrl = "http://localhost:8080"

    private fun fakeMapping(urlHash: String, shortUrl: String, original: String) = UrlMapping(
        urlHash = urlHash,
        shortUrl = shortUrl,
        originalUrl = original,
        createdAt = LocalDateTime.now(),
        expirationDate = LocalDateTime.now().plusDays(365),
        requestIp = "127.0.0.1",
        userAgent = null,
        userId = null
    )

    private fun createShortener(baseUrl: String = this.baseUrl) = UrlShortener(
        urlRepository = urlRepository,
        urlValidator = urlValidator,
        daysCountValidator = daysCountValidator,
        urlMappingEntityCreator = urlMappingEntityCreator,
        baseUrl = baseUrl
    )

    @Test
    fun `two different original URLs produce different short codes`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlMappingEntityCreator.create(any(), any(), any(), any())).thenAnswer { inv ->
            val hash = inv.arguments[2] as String
            val short = inv.arguments[3] as String
            val req = inv.arguments[0] as ShortenUrlRequest
            fakeMapping(hash, short, req.originalUrl)
        }
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val urlShortener = createShortener()
        val shortUrl1 = urlShortener.shortenUrl(ShortenUrlRequest("http://example.com", null), httpRequest)
        val shortUrl2 = urlShortener.shortenUrl(ShortenUrlRequest("http://other.com", null), httpRequest)

        assertNotEquals(shortUrl1, shortUrl2, "Different URLs must produce different short codes")
    }

    @Test
    fun `same URL called twice creates two separate mappings without global deduplication`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlMappingEntityCreator.create(any(), any(), any(), any())).thenAnswer { inv ->
            val hash = inv.arguments[2] as String
            val short = inv.arguments[3] as String
            fakeMapping(hash, short, "http://example.com")
        }
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val urlShortener = createShortener()
        urlShortener.shortenUrl(ShortenUrlRequest("http://example.com", null), httpRequest)
        urlShortener.shortenUrl(ShortenUrlRequest("http://example.com", null), httpRequest)

        verify(urlRepository, times(2)).insert(any<UrlMapping>())
        verify(urlRepository, never()).findByUrlHash(any())
    }

    @Test
    fun `insert collision retries and succeeds`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        var callCount = 0
        whenever(urlMappingEntityCreator.create(any(), any(), any(), any())).thenAnswer { inv ->
            val hash = inv.arguments[2] as String
            val short = inv.arguments[3] as String
            fakeMapping(hash, short, "http://example.com")
        }
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { inv ->
            if (callCount++ < 1) throw DuplicateKeyException("collision")
            inv.arguments[0]
        }

        val urlShortener = createShortener()
        val shortUrl = urlShortener.shortenUrl(ShortenUrlRequest("http://example.com", null), httpRequest)

        assertTrue(shortUrl.startsWith("http://localhost:8080/"))
        verify(urlRepository, times(2)).insert(any<UrlMapping>())
        verify(urlRepository, never()).findByUrlHash(any())
    }

    @Test
    fun `shortenUrl throws when insert collisions exhaust all retries`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlMappingEntityCreator.create(any(), any(), any(), any())).thenAnswer { inv ->
            val hash = inv.arguments[2] as String
            val short = inv.arguments[3] as String
            fakeMapping(hash, short, "http://example.com")
        }
        whenever(urlRepository.insert(any<UrlMapping>())).thenThrow(DuplicateKeyException("collision"))

        val urlShortener = createShortener()
        assertThrows<IllegalStateException> {
            urlShortener.shortenUrl(ShortenUrlRequest("http://example.com", null), httpRequest)
        }

        verify(urlRepository, times(10)).insert(any<UrlMapping>())
        verify(urlRepository, never()).findByUrlHash(any())
    }

    @Test
    fun `baseUrl trailing slash does not produce double slash`() {
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
        whenever(urlMappingEntityCreator.create(any(), any(), any(), any())).thenAnswer { inv ->
            val hash = inv.arguments[2] as String
            val short = inv.arguments[3] as String
            fakeMapping(hash, short, "http://example.com")
        }
        whenever(urlRepository.insert(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val urlShortener = createShortener("http://localhost:8080/")
        val shortUrl = urlShortener.shortenUrl(ShortenUrlRequest("http://example.com", null), httpRequest)

        assertTrue(shortUrl.startsWith("http://localhost:8080/"))
        assertTrue(!shortUrl.removePrefix("http://localhost:8080").contains("//"))
    }
}
