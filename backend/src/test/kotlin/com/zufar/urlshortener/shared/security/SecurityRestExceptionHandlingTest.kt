package com.zufar.urlshortener.shared.security

import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.service.UrlMappingProvider
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDateTime

@SpringBootTest
@AutoConfigureMockMvc
class SecurityRestExceptionHandlingTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var urlShortener: UrlShortener

    @Autowired
    private lateinit var urlMappingProvider: UrlMappingProvider

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
        whenever(urlShortener.shortenUrl(any(), any())).thenReturn("http://localhost:8080/abc12345")

        mockMvc.perform(
            post("/api/v1/urls")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"originalUrl":"https://example.com","daysCount":1}""")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.shortUrl").value("http://localhost:8080/abc12345"))
    }

    @Test
    fun `public short url redirect remains accessible without auth`() {
        whenever(urlMappingProvider.getPublicUrlMappingByHash("abc12345")).thenReturn(
            UrlMappingDto(
                urlHash = "abc12345",
                shortUrl = "http://localhost:8080/abc12345",
                originalUrl = "https://example.com/original",
                createdAt = LocalDateTime.now(),
                expirationDate = LocalDateTime.now().plusHours(1)
            )
        )

        mockMvc.perform(get("/abc12345"))
            .andExpect(status().isFound)
            .andExpect(header().string("Location", "https://example.com/original"))
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
        fun urlShortener(): UrlShortener = mock()

        @Bean
        @Primary
        fun urlMappingProvider(): UrlMappingProvider = mock()
    }
}
