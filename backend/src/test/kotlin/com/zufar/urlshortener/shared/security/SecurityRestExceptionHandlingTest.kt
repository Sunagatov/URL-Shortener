package com.zufar.urlshortener.shared.security

import com.zufar.urlshortener.urls.service.UrlShortener
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
class SecurityRestExceptionHandlingTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var urlShortener: UrlShortener

    @Test
    fun `users endpoint without auth returns 401 JSON`() {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isUnauthorized)
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.errorMessage").value("Unauthorized access"))
    }

    @Test
    fun `url mapping endpoint without auth returns 401 JSON`() {
        mockMvc.perform(get("/api/v1/urls/someHash"))
            .andExpect(status().isUnauthorized)
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.errorMessage").value("Unauthorized access"))
    }

    @Test
    fun `shorten url endpoint remains publicly accessible`() {
        whenever(urlShortener.shortenUrl(any(), any())).thenReturn("http://localhost:8080/url/abc123")

        mockMvc.perform(
            post("/api/v1/urls")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"originalUrl":"https://example.com","daysCount":1}""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.shortUrl").value("http://localhost:8080/url/abc123"))
    }

    @TestConfiguration
    class TestConfig {

        @Bean
        @Primary
        fun urlShortener(): UrlShortener = mock()
    }
}
