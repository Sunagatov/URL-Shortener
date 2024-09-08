package com.zufar.urlshortener.shortener

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import reactor.core.publisher.Mono
import reactor.test.StepVerifier

class InMemoryUrlRetrieverTest {

    private lateinit var inMemoryUrlRetriever: InMemoryUrlRetriever

    @BeforeEach
    fun setUp() {
        inMemoryUrlRetriever = mock()
    }

    @Test
    fun `should retrieve URL successfully when short URL exists`() {
        val shortUrl = "shortUrl123"
        val originalUrl = "https://example.com"

        whenever(inMemoryUrlRetriever.retrieveUrl(shortUrl))
            .thenReturn(Mono.just(originalUrl))

        val result = inMemoryUrlRetriever.retrieveUrl(shortUrl)

        StepVerifier.create(result)
            .expectNext(originalUrl)
            .verifyComplete()

        verify(inMemoryUrlRetriever).retrieveUrl(shortUrl)
    }

    @Test
    fun `should return error when short URL does not exist`() {
        val shortUrl = "nonExistentUrl"

        whenever(inMemoryUrlRetriever.retrieveUrl(shortUrl))
            .thenReturn(Mono.error(NoSuchElementException("URL not found")))

        val result = inMemoryUrlRetriever.retrieveUrl(shortUrl)

        StepVerifier.create(result)
            .expectError(NoSuchElementException::class.java)
            .verify()

        verify(inMemoryUrlRetriever).retrieveUrl(shortUrl)
    }
}