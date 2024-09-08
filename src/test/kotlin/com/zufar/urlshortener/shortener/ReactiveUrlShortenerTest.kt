package com.zufar.urlshortener.shortener

import com.zufar.urlshortener.encoder.StringEncoder
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import reactor.test.StepVerifier

class ReactiveUrlShortenerTest {

    private lateinit var urlShortener: UrlShortener

    @BeforeEach
    fun setUp() {
        urlShortener = ReactiveUrlShortener()
    }

    @Test
    fun `should shorten URL successfully`() {
        val originalUrl = "https://example.com"
        val expectedShortUrl = StringEncoder.encode(originalUrl)

        StepVerifier.create(urlShortener.shortenUrl(originalUrl))
            .expectNext(expectedShortUrl)
            .verifyComplete()
    }

    @Test
    fun `should store URL in memory`() {
        val originalUrl = "https://example.com"
        val shortUrl = StringEncoder.encode(originalUrl)

        urlShortener.shortenUrl(originalUrl).block()

        val storedUrl = urlShortener.getUrlMap()[shortUrl]

        assert(storedUrl == originalUrl) { "Expected URL to be $originalUrl but was $storedUrl" }
    }
}
