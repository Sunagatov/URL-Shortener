package com.zufar.urlshortener.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertDoesNotThrow

class UrlValidatorTest {

    private val urlValidator = UrlValidator()

    @Test
    fun `should not throw exception for valid URL`() {
        val validUrl = "https://example.com"
        assertDoesNotThrow { urlValidator.validateUrl(validUrl) }
    }

    @Test
    fun `should throw exception for URL with spaces`() {
        val urlWithSpaces = "https://example .com"
        val exception = assertThrows(IllegalArgumentException::class.java) {
            urlValidator.validateUrl(urlWithSpaces)
        }
        assert(exception.message == "URL must not contain spaces")
    }

    @Test
    fun `should throw exception for URL with invalid protocol`() {
        val urlWithInvalidProtocol = "ftp://example.com"
        val exception = assertThrows(IllegalArgumentException::class.java) {
            urlValidator.validateUrl(urlWithInvalidProtocol)
        }
        assert(exception.message == "URL must use HTTP or HTTPS protocol")
    }

    @Test
    fun `should throw exception for URL with loopback address`() {
        val urlWithLoopbackAddress = "http://localhost/api/shorten"
        val exception = assertThrows(IllegalArgumentException::class.java) {
            urlValidator.validateUrl(urlWithLoopbackAddress)
        }
        assert(exception.message == "URL cannot point to a loopback address")
    }

    @Test
    fun `should throw exception for URL that is too long`() {
        val longUrl = "http://" + "a".repeat(2001)
        val exception = assertThrows(IllegalArgumentException::class.java) {
            urlValidator.validateUrl(longUrl)
        }
        assert(exception.message == "URL is too long")
    }
}
