package com.zufar.urlshortener.common.exception

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
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
}
