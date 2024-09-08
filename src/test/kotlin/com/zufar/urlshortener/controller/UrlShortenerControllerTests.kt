package com.zufar.urlshortener.controller

import com.zufar.urlshortener.common.dto.UrlRequest
import com.zufar.urlshortener.service.UrlShortener
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
    private lateinit var urlShortener: UrlShortener

    @Test
    fun `should shorten URL successfully`() {
        val requestBody = UrlRequest("https://example.com")
        val shortUrl = "http://localhost:8080/shortUrl123"
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
}
