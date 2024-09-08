package com.zufar.urlshortener.controller

import com.zufar.urlshortener.service.UrlRetriever
import org.junit.jupiter.api.Test
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.web.reactive.server.WebTestClient
import reactor.core.publisher.Mono

@WebFluxTest(UrlRedirectController::class)
class UrlRedirectControllerTest(@Autowired val webTestClient: WebTestClient) {

    @MockBean
    private lateinit var urlRetriever: UrlRetriever

    @Test
    fun `should redirect to original URL successfully`() {
        val shortUrl = "shortUrl123"
        val originalUrl = "https://example.com"
        whenever(urlRetriever.retrieveUrl(shortUrl)).thenReturn(Mono.just(originalUrl))

        webTestClient.get()
            .uri("/{shortUrl}", shortUrl)
            .exchange()
            .expectStatus().isFound
            .expectHeader().location(originalUrl)
    }

    @Test
    fun `should return not found for non-existent short URL`() {
        val shortUrl = "nonExistentUrl"
        whenever(urlRetriever.retrieveUrl(shortUrl)).thenReturn(Mono.error(NoSuchElementException("URL not found")))

        webTestClient.get()
            .uri("/{shortUrl}", shortUrl)
            .exchange()
            .expectStatus().isNotFound
    }
}
