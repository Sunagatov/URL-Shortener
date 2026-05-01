package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.shared.exception.ApplicationException
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import java.net.InetAddress

class UrlValidatorTest {

    @Test
    fun `same host as configured base url is rejected`() {
        val validator = UrlValidator("http://116.203.197.65:8080", stubResolver())

        assertThrows<ApplicationException> {
            validator.validateUrl("http://116.203.197.65:8080/url/abc123")
        }
    }

    @Test
    fun `configured domain host is rejected`() {
        val validator = UrlValidator("https://short.example.com", stubResolver())

        assertThrows<ApplicationException> {
            validator.validateUrl("https://short.example.com/url/abc123")
        }
    }

    @Test
    fun `loopback hosts are rejected`() {
        val validator = UrlValidator("https://short.example.com", stubResolver())

        assertThrows<ApplicationException> {
            validator.validateUrl("http://localhost:8080/example")
        }
    }

    @Test
    fun `private ipv4 addresses are rejected`() {
        val validator = UrlValidator("https://short.example.com", stubResolver())

        assertThrows<ApplicationException> {
            validator.validateUrl("https://10.0.0.7/internal")
        }
    }

    @Test
    fun `link local metadata addresses are rejected`() {
        val validator = UrlValidator("https://short.example.com", stubResolver())

        assertThrows<ApplicationException> {
            validator.validateUrl("http://169.254.169.254/latest/meta-data")
        }
    }

    @Test
    fun `urls with embedded credentials are rejected`() {
        val validator = UrlValidator("https://short.example.com", stubResolver())

        assertThrows<ApplicationException> {
            validator.validateUrl("https://user:secret@example.com/path")
        }
    }

    @Test
    fun `domains resolving to private addresses are rejected`() {
        val validator = UrlValidator(
            "https://short.example.com",
            stubResolver("internal.example" to listOf("192.168.1.10"))
        )

        assertThrows<ApplicationException> {
            validator.validateUrl("https://internal.example/path")
        }
    }

    @Test
    fun `public ipv4 addresses are accepted`() {
        val validator = UrlValidator("https://short.example.com", stubResolver())

        assertDoesNotThrow {
            validator.validateUrl("https://93.184.216.34/path")
        }
    }

    private fun stubResolver(vararg entries: Pair<String, List<String>>) = { host: String ->
        val mappedAddresses = entries.toMap()[host]
        val values = mappedAddresses ?: listOf(host)
        values.map(InetAddress::getByName).toTypedArray()
    }
}
