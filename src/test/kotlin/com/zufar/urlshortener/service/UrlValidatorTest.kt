package com.zufar.urlshortener.service

import org.junit.jupiter.api.Test
import kotlin.test.assertFailsWith

class UrlValidatorTest {

    private val urlValidator = UrlValidator()

    @Test
    fun `should throw exception for invalid protocol`() {
        val invalidUrl = "ftp://example.com"
        val exception = assertFailsWith<IllegalArgumentException> {
            urlValidator.validateUrl(invalidUrl)
        }
        assert(exception.message?.contains("URL must use HTTP or HTTPS protocol") == true)
    }

    @Test
    fun `should throw exception for missing host`() {
        val invalidUrl = "http:///path"
        val exception = assertFailsWith<IllegalArgumentException> {
            urlValidator.validateUrl(invalidUrl)
        }
        assert(exception.message?.contains("URL must have a valid host") == true)
    }

    @Test
    fun `should throw exception for loopback address`() {
        val invalidUrl = "http://localhost/"
        val exception = assertFailsWith<IllegalArgumentException> {
            urlValidator.validateUrl(invalidUrl)
        }
        assert(exception.message?.contains("URL cannot point to a loopback address") == true)
    }

    @Test
    fun `should throw exception for URL that is too long`() {
        val longUrl = "http://" + "a".repeat(2001)
        val exception = assertFailsWith<IllegalArgumentException> {
            urlValidator.validateUrl(longUrl)
        }
        assert(exception.message?.contains("URL is too long") == true)
    }

    @Test
    fun `should validate URL successfully`() {
        val validUrl = "https://example.com"
        urlValidator.validateUrl(validUrl) // No exception should be thrown
    }
}
