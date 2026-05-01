package com.zufar.urlshortener.shared.web

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
class RequestValidationIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `invalid shorten url request returns 400 instead of 500`() {
        mockMvc.perform(
            post("/api/v1/urls")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"originalUrl":"","daysCount":0}""")
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorMessage").exists())
    }

    @Test
    fun `missing refresh token field returns 400 instead of 500`() {
        mockMvc.perform(
            post("/api/v1/auth/refresh-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorMessage").value("Required request field is missing"))
    }

    @Test
    fun `wrong type refresh token field returns 400 with invalid type message`() {
        mockMvc.perform(
            post("/api/v1/auth/refresh-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"refreshToken":{}}""")
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorMessage").value("Request field has an invalid value or type"))
    }

    @Test
    fun `wrong type days count field returns 400 with invalid type message`() {
        mockMvc.perform(
            post("/api/v1/urls")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"originalUrl":"https://a.com","daysCount":"abc"}""")
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorMessage").value("Request field has an invalid value or type"))
    }

    @Test
    fun `invalid frontend log level returns 400 instead of 500`() {
        mockMvc.perform(
            post("/api/v1/frontend/logs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "level":"fatal",
                      "message":"frontend.runtime.window_error",
                      "runtime":"browser",
                      "sessionId":"session-123",
                      "timestamp":"2026-04-30T13:00:00Z"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorMessage").value("Log level must be one of debug, info, warn, or error"))
    }

    @Test
    fun `invalid frontend log timestamp returns 400 instead of 500`() {
        mockMvc.perform(
            post("/api/v1/frontend/logs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                      "level":"warn",
                      "message":"frontend.runtime.window_error",
                      "runtime":"browser",
                      "sessionId":"session-123",
                      "timestamp":"not-a-timestamp"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorMessage").value("Timestamp must be a valid ISO-8601 instant"))
    }
}
