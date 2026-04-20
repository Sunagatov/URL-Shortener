package com.zufar.urlshortener.shorten.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class UrlValidatorTest {

    @Test
    fun `same host as configured base url is rejected`() {
        val validator = UrlValidator("http://116.203.197.65:8080")

        assertThrows<IllegalArgumentException> {
            validator.validateUrl("http://116.203.197.65:8080/url/abc123")
        }
    }

    @Test
    fun `configured domain host is rejected`() {
        val validator = UrlValidator("https://short.example.com")

        assertThrows<IllegalArgumentException> {
            validator.validateUrl("https://short.example.com/url/abc123")
        }
    }

    @Test
    fun `loopback hosts are rejected`() {
        val validator = UrlValidator("https://short.example.com")

        assertThrows<IllegalArgumentException> {
            validator.validateUrl("http://localhost:8080/example")
        }
    }

    @Test
    fun `unrelated external host is accepted`() {
        val validator = UrlValidator("https://short.example.com")

        validator.validateUrl("https://www.example.org/path")
    }
}
