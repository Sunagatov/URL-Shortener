package com.zufar.urlshortener.auth.exception

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.http.HttpStatus

class CouldAuthExceptionHandlerTest {

    private val handler = AuthExceptionHandler()
    private val request = MockHttpServletRequest("POST", "/api/v1/auth/refresh-token")

    @Test
    fun `invalid token exception returns 401 with original message`() {
        val response = handler.handleInvalidTokenException(
            InvalidTokenException("Invalid or expired refresh token"),
            request
        )

        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
        assertEquals("Invalid or expired refresh token", response.body!!.errorMessage)
    }
}
