package com.zufar.urlshortener.controller

import com.zufar.urlshortener.shortener.InMemoryUrlRetriever
import com.zufar.urlshortener.dto.UrlRequest
import com.zufar.urlshortener.shortener.ReactiveUrlShortener
import org.junit.jupiter.api.Test
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.reactive.server.WebTestClient
import reactor.core.publisher.Mono

@WebFluxTest(UrlShortenerController::class)
class UrlShortenerControllerTests(@Autowired val webTestClient: WebTestClient) {

    @MockBean
    private lateinit var urlShortener: ReactiveUrlShortener

    @MockBean
    private lateinit var urlRetriever: InMemoryUrlRetriever

    @Test
    fun `should shorten URL successfully`() {
        val requestBody = UrlRequest("https://example.com")
        val shortUrl = "shortUrl123"
        whenever(urlShortener.shortenUrl(requestBody.url)).thenReturn(Mono.just(shortUrl))

        webTestClient.post()
            .uri("/api/shorten")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(requestBody)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.shortUrl").isEqualTo(shortUrl)
    }

    @Test
    fun `should return bad request for invalid URL`() {
        val requestBody = UrlRequest("invalid-url")
        whenever(urlShortener.shortenUrl(requestBody.url)).thenReturn(Mono.error(IllegalArgumentException("Invalid URL")))

        webTestClient.post()
            .uri("/api/shorten")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(requestBody)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should retrieve original URL successfully`() {
        val shortUrl = "shortUrl123"
        val originalUrl = "https://example.com"
        whenever(urlRetriever.retrieveUrl(shortUrl)).thenReturn(Mono.just(originalUrl))

        webTestClient.get()
            .uri("/api/retrieve/{shortUrl}", shortUrl)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.shortUrl").isEqualTo(originalUrl)
    }

    @Test
    fun `should return not found for non-existent short URL`() {
        val shortUrl = "nonExistentUrl"
        whenever(urlRetriever.retrieveUrl(shortUrl)).thenReturn(Mono.error(NoSuchElementException("URL not found")))

        webTestClient.get()
            .uri("/api/retrieve/{shortUrl}", shortUrl)
            .exchange()
            .expectStatus().isNotFound
    }
}
