package com.zufar.urlshortener.shared.security

import com.zufar.urlshortener.urls.service.UrlVisitTracker
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.service.UrlManagementService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant

@SpringBootTest
@AutoConfigureMockMvc
class SecurityRestExceptionHandlingTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var urlManagementService: UrlManagementService

    @Test
    fun `users endpoint without auth returns 401 JSON`() {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isUnauthorized)
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(header().exists("X-Correlation-ID"))
            .andExpect(header().exists("X-Request-ID"))
            .andExpect(header().string("X-Content-Type-Options", "nosniff"))
            .andExpect(header().string("X-Frame-Options", "DENY"))
            .andExpect(header().string("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload"))
            .andExpect(jsonPath("$.errorMessage").value("Unauthorized access"))
            .andExpect(jsonPath("$.requestId").isNotEmpty)
    }

    @Test
    fun `url mapping endpoint without auth returns 401 JSON`() {
        mockMvc.perform(get("/api/v1/urls/someHash"))
            .andExpect(status().isUnauthorized)
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(header().exists("X-Correlation-ID"))
            .andExpect(header().exists("X-Request-ID"))
            .andExpect(jsonPath("$.errorMessage").value("Unauthorized access"))
            .andExpect(jsonPath("$.requestId").isNotEmpty)
    }

    @Test
    fun `shorten url endpoint remains publicly accessible`() {
        whenever(urlManagementService.shorten(any(), any())).thenReturn("http://localhost:8080/abc12345")

        mockMvc.perform(
            post("/api/v1/urls")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"originalUrl":"https://example.com","daysCount":1}""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.shortUrl").value("http://localhost:8080/abc12345"))
    }

    @Test
    fun `frontend logs endpoint remains publicly accessible`() {
        mockMvc.perform(
            post("/api/v1/frontend/logs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "level":"warn",
                      "message":"frontend.api.request_failed",
                      "runtime":"browser",
                      "sessionId":"session-123",
                      "timestamp":"2026-04-30T13:00:00Z",
                      "context":{"status":500}
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isAccepted)
    }

    @Test
    fun `public short url redirect remains accessible without auth`() {
        val now = Instant.now()
        whenever(urlManagementService.getActiveUrlMapping("abc12345")).thenReturn(
            UrlMapping(
                urlHash = "abc12345",
                shortUrl = "http://localhost:8080/abc12345",
                originalUrl = "https://example.com/original",
                clickCount = 0,
                createdAt = now,
                expirationDate = now.plusSeconds(3600),
                requestIp = null,
                userAgent = null,
                userId = null
            )
        )

        mockMvc.perform(get("/abc12345"))
            .andExpect(status().isFound)
            .andExpect(header().string("Location", "https://example.com/original"))
            .andExpect(header().string("Referrer-Policy", "no-referrer"))
            .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("public")))
    }

    @Test
    fun `favicon request does not require auth`() {
        mockMvc.perform(get("/favicon.ico"))
            .andExpect(status().isNoContent)
    }

    @TestConfiguration
    class TestConfig {

        @Bean
        @Primary
        fun urlManagementService(): UrlManagementService = mock()

        @Bean
        @Primary
        fun urlVisitTracker(): UrlVisitTracker = mock()
    }
}
