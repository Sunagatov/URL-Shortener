package com.zufar.urlshortener.service

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import reactor.test.StepVerifier

class InMemoryUrlShortenerTests {

    private lateinit var inMemoryUrlShortener: InMemoryUrlShortener

    @BeforeEach
    fun setUp() {
        inMemoryUrlShortener = InMemoryUrlShortener()
    }

    @Test
    fun `should shorten URL successfully`() {
        val originalUrl = "https://example.com"
        val expectedShortUrl = "shortUrl123"

        StepVerifier.create(inMemoryUrlShortener.shortenUrl(originalUrl))
            .expectNext(expectedShortUrl)
            .verifyComplete()
    }

    @Test
    fun `should store URL in memory`() {
        val originalUrl = "https://example.com"
        val shortUrl = "shortUrl123"

        // Shorten the URL
        inMemoryUrlShortener.shortenUrl(originalUrl).block()

        // Retrieve the stored URL from the internal map using the getter method
        val storedUrl = inMemoryUrlShortener.getUrlMap()[shortUrl]

        // Verify that the stored URL matches the original URL
        assert(storedUrl == originalUrl) { "Expected URL to be $originalUrl but was $storedUrl" }
    }
}
