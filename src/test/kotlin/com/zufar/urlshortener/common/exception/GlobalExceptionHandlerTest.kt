package com.zufar.urlshortener.common.exception

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

class GlobalExceptionHandlerTest {

    private val handler = GlobalExceptionHandler()

    @Test
    fun `unhandled exception returns 500 with generic message not raw exception text`() {
        val secretMessage = "internal DB password is hunter2"
        val ex = RuntimeException(secretMessage)

        val response = handler.handleException(ex)

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.statusCode)
        val body = response.body!!.errorMessage
        assertFalse(body.contains(secretMessage), "500 response must not leak raw exception message")
        assertEquals("An unexpected error occurred", body)
    }

    @Test
    fun `unhandled exception with null message returns generic message`() {
        val ex = RuntimeException()

        val response = handler.handleException(ex)

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.statusCode)
        assertEquals("An unexpected error occurred", response.body!!.errorMessage)
    }
}
