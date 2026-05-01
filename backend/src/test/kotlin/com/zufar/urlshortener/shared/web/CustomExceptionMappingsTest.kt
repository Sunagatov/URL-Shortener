package com.zufar.urlshortener.shared.web

import com.zufar.urlshortener.shared.exception.ApplicationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

class CustomExceptionMappingsTest {

    private val handler = GlobalExceptionHandler()

    @Test
    fun `invalid token exception returns 401 with original message`() {
        val response = handler.handleApplicationException(
            ApplicationException.unauthorized("INVALID_TOKEN", "Invalid or expired refresh token")
        )

        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
        assertEquals("Invalid or expired refresh token", response.body!!.errorMessage)
        assertEquals("INVALID_TOKEN", response.body!!.code)
    }

    @Test
    fun `verification resend too soon includes retry after seconds`() {
        val response = handler.handleApplicationException(
            ApplicationException.tooManyRequests("VERIFICATION_RESEND_TOO_SOON", "Verification code was sent recently", 42)
        )

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, response.statusCode)
        assertEquals(42, response.body!!.retryAfterSeconds)
        assertEquals("VERIFICATION_RESEND_TOO_SOON", response.body!!.code)
    }

    @Test
    fun `url not found exception returns 404 with url code`() {
        val response = handler.handleApplicationException(
            ApplicationException.notFound("URL_NOT_FOUND", "URL mapping not found")
        )

        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        assertEquals("URL_NOT_FOUND", response.body!!.code)
    }

    @Test
    fun `invalid user request exception returns 400 with user code`() {
        val response = handler.handleApplicationException(
            ApplicationException.badRequest("INVALID_USER_REQUEST", "Current password is incorrect")
        )

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("INVALID_USER_REQUEST", response.body!!.code)
    }

    @Test
    fun `invalid frontend log request exception returns 400 with frontend code`() {
        val response = handler.handleApplicationException(
            ApplicationException.badRequest("INVALID_FRONTEND_LOG_REQUEST", "Timestamp must be a valid ISO-8601 instant")
        )

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("INVALID_FRONTEND_LOG_REQUEST", response.body!!.code)
    }
}
