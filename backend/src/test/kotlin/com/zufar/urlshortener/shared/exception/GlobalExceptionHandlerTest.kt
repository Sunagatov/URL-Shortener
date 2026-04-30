package com.zufar.urlshortener.shared.exception

import com.zufar.urlshortener.auth.exception.InvalidTokenException
import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.urls.dto.ShortenUrlRequest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.mock.http.MockHttpInputMessage
import org.springframework.http.HttpStatus
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.core.MethodParameter
import org.springframework.validation.BeanPropertyBindingResult
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import tools.jackson.databind.exc.MismatchedInputException
import tools.jackson.module.kotlin.jacksonObjectMapper
import tools.jackson.module.kotlin.readValue

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

    @Test
    fun `invalid token exception returns 401 with original message`() {
        val response = handler.handleInvalidTokenException(InvalidTokenException("Invalid or expired refresh token"))

        assertEquals(HttpStatus.UNAUTHORIZED, response.statusCode)
        assertEquals("Invalid or expired refresh token", response.body!!.errorMessage)
    }

    @Test
    fun `illegal argument exception returns 400 with original message`() {
        val response = handler.handleIllegalArgumentException(IllegalArgumentException("Invalid input"))

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Invalid input", response.body!!.errorMessage)
    }

    @Test
    fun `method argument validation exception returns 400`() {
        val bindingResult = BeanPropertyBindingResult(ShortenUrlRequest("", 0), "shortenUrlRequest")
        bindingResult.addError(FieldError("shortenUrlRequest", "daysCount", "Days count must be at least 1"))
        val ex = MethodArgumentNotValidException(methodParameter(), bindingResult)

        val response = handler.handleMethodArgumentNotValidException(ex)

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Days count must be at least 1", response.body!!.errorMessage)
    }

    @Test
    fun `missing kotlin parameter request body exception returns 400`() {
        val cause = assertThrows<MismatchedInputException> {
            jacksonObjectMapper().readValue<RefreshTokenRequest>("{}")
        }
        val ex = HttpMessageNotReadableException("Unreadable JSON", cause, MockHttpInputMessage(ByteArray(0)))

        val response = handler.handleHttpMessageNotReadableException(ex)

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Required request field is missing", response.body!!.errorMessage)
    }

    @Test
    fun `wrong type request body exception returns 400 with invalid type message`() {
        val cause = assertThrows<MismatchedInputException> {
            jacksonObjectMapper().readValue<RefreshTokenRequest>("""{"refreshToken":{}}""")
        }
        val ex = HttpMessageNotReadableException("Unreadable JSON", cause, MockHttpInputMessage(ByteArray(0)))

        val response = handler.handleHttpMessageNotReadableException(ex)

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Request field has an invalid value or type", response.body!!.errorMessage)
    }

    @Test
    fun `malformed json request body exception returns 400`() {
        val ex = HttpMessageNotReadableException("Malformed JSON", MockHttpInputMessage(ByteArray(0)))

        val response = handler.handleHttpMessageNotReadableException(ex)

        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Malformed JSON request", response.body!!.errorMessage)
    }

    @Suppress("unused")
    private fun dummyEndpoint(request: ShortenUrlRequest) = request

    private fun methodParameter(): MethodParameter {
        val method = this::class.java.getDeclaredMethod("dummyEndpoint", ShortenUrlRequest::class.java)
        return MethodParameter(method, 0)
    }
}
