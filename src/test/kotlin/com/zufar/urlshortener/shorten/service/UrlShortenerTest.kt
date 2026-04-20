package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.shorten.dto.ShortenUrlRequest
import com.zufar.urlshortener.shorten.entity.UrlMapping
import com.zufar.urlshortener.shorten.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.test.util.ReflectionTestUtils
import java.time.LocalDateTime
import java.util.Optional
import kotlin.test.assertNotEquals

@ExtendWith(MockitoExtension::class)
class UrlShortenerTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock @Suppress("unused") private lateinit var urlValidator: UrlValidator
    @Mock @Suppress("unused") private lateinit var daysCountValidator: DaysCountValidator
    @Mock private lateinit var urlMappingEntityCreator: UrlMappingEntityCreator
    @Mock private lateinit var httpRequest: HttpServletRequest

    @InjectMocks private lateinit var urlShortener: UrlShortener

    @BeforeEach
    fun setup() {
        ReflectionTestUtils.setField(urlShortener, "baseUrl", "http://localhost:8080")
        whenever(httpRequest.remoteAddr).thenReturn("127.0.0.1")
    }

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

    @Test
    fun `two different original URLs produce different short codes`() {
        whenever(urlRepository.findByUrlHash(any())).thenReturn(Optional.empty())
        whenever(urlMappingEntityCreator.create(any(), any(), any(), any())).thenAnswer { inv ->
            val hash = inv.arguments[2] as String
            val short = inv.arguments[3] as String
            val req = inv.arguments[0] as ShortenUrlRequest
            fakeMapping(hash, short, req.originalUrl)
        }

        val shortUrl1 = urlShortener.shortenUrl(ShortenUrlRequest("http://example.com", null), httpRequest)
        val shortUrl2 = urlShortener.shortenUrl(ShortenUrlRequest("http://other.com", null), httpRequest)

        assertNotEquals(shortUrl1, shortUrl2, "Different URLs must produce different short codes")
    }

    @Test
    fun `same URL called twice creates two separate mappings without global deduplication`() {
        whenever(urlRepository.findByUrlHash(any())).thenReturn(Optional.empty())
        whenever(urlMappingEntityCreator.create(any(), any(), any(), any())).thenAnswer { inv ->
            val hash = inv.arguments[2] as String
            val short = inv.arguments[3] as String
            fakeMapping(hash, short, "http://example.com")
        }

        urlShortener.shortenUrl(ShortenUrlRequest("http://example.com", null), httpRequest)
        urlShortener.shortenUrl(ShortenUrlRequest("http://example.com", null), httpRequest)

        verify(urlRepository, times(2)).save(any())
    }

    @Test
    fun `generateUniqueCode retries on collision and succeeds`() {
        var callCount = 0
        whenever(urlRepository.findByUrlHash(any())).thenAnswer {
            if (callCount++ < 1) Optional.of(fakeMapping("collision1", "http://localhost/url/collision1", "http://taken.com"))
            else Optional.empty()
        }
        whenever(urlMappingEntityCreator.create(any(), any(), any(), any())).thenAnswer { inv ->
            val hash = inv.arguments[2] as String
            val short = inv.arguments[3] as String
            fakeMapping(hash, short, "http://example.com")
        }

        urlShortener.shortenUrl(ShortenUrlRequest("http://example.com", null), httpRequest)

        verify(urlRepository, times(1)).save(any())
    }

    @Test
    fun `shortenUrl throws when code generation exhausts all retries`() {
        whenever(urlRepository.findByUrlHash(any())).thenReturn(
            Optional.of(fakeMapping("aaaaaaaa", "http://localhost:8080/url/aaaaaaaa", "http://taken.com"))
        )

        assertThrows<IllegalStateException> {
            urlShortener.shortenUrl(ShortenUrlRequest("http://example.com", null), httpRequest)
        }
    }
}
