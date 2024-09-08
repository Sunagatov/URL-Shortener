package com.zufar.urlshortener.service

import com.zufar.urlshortener.common.entity.UrlMapping
import com.zufar.urlshortener.repository.UrlRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.doNothing
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import reactor.core.publisher.Mono
import reactor.test.StepVerifier

class UrlShortenerTest {

    private lateinit var urlShortener: UrlShortener
    private lateinit var urlRepository: UrlRepository
    private lateinit var urlValidator: UrlValidator

    @BeforeEach
    fun setUp() {
        urlRepository = mock()
        urlValidator = mock()
        urlShortener = UrlShortener(urlRepository, urlValidator)
    }

    @Test
    fun `should shorten URL successfully`() {
        val originalUrl = "https://example.com"
        val shortUrl = StringEncoder.encode(originalUrl)
        val urlMapping = UrlMapping(shortUrl, originalUrl)

        whenever(urlRepository.save(urlMapping)).thenReturn(Mono.just(urlMapping))
        doNothing().`when`(urlValidator).validateUrl(originalUrl)

        StepVerifier.create(urlShortener.shortenUrl(originalUrl))
            .expectNext("http://localhost:8080/$shortUrl")
            .verifyComplete()

        verify(urlRepository).save(urlMapping)
    }

    @Test
    fun `should store URL in repository`() {
        val originalUrl = "https://example.com"
        val shortUrl = StringEncoder.encode(originalUrl)
        val urlMapping = UrlMapping(shortUrl, originalUrl)

        whenever(urlRepository.save(urlMapping)).thenReturn(Mono.just(urlMapping))
        doNothing().`when`(urlValidator).validateUrl(originalUrl)

        urlShortener.shortenUrl(originalUrl).block()

        verify(urlRepository).save(urlMapping)
    }
}
