package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.shared.exception.ApplicationException
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import java.net.InetAddress

class UrlValidatorTest {

    @Test
    fun `same host as configured base url is rejected`() {
        val validator = validator("http://116.203.197.65:8080")

        assertThrows<ApplicationException> {
            validator.validateUrl("http://116.203.197.65:8080/url/abc123")
        }
    }

    @Test
    fun `configured domain host is rejected`() {
        val validator = validator("https://short.example.com")

        assertThrows<ApplicationException> {
            validator.validateUrl("https://short.example.com/url/abc123")
        }
    }

    @Test
    fun `configured blocked alias hosts are rejected`() {
        val validator = validator("https://zuf.uk", "www.zuf.uk, api.zuf.uk")

        assertThrows<ApplicationException> {
            validator.validateUrl("https://api.zuf.uk/abc12345")
        }
    }

    @Test
    fun `configured blocked alias hosts are rejected with trailing dot`() {
        val validator = validator("https://zuf.uk", "www.zuf.uk, api.zuf.uk")

        assertThrows<ApplicationException> {
            validator.validateUrl("https://api.zuf.uk./abc12345")
        }
    }

    @Test
    fun `localhost subdomains are rejected without DNS lookup`() {
        val validator = validator("https://short.example.com")

        assertThrows<ApplicationException> {
            validator.validateUrl("http://anything.localhost/example")
        }
    }

    @Test
    fun `single label hostnames are rejected`() {
        val validator = validator(
            "https://short.example.com",
            resolver = stubResolver("intranet" to listOf("93.184.216.34"))
        )

        assertThrows<ApplicationException> {
            validator.validateUrl("http://intranet/login")
        }
    }

    @Test
    fun `loopback hosts are rejected`() {
        val validator = validator("https://short.example.com")

        assertThrows<ApplicationException> {
            validator.validateUrl("http://localhost:8080/example")
        }
    }

    @Test
    fun `private ipv4 addresses are rejected`() {
        val validator = validator("https://short.example.com")

        assertThrows<ApplicationException> {
            validator.validateUrl("https://10.0.0.7/internal")
        }
    }

    @Test
    fun `link local metadata addresses are rejected`() {
        val validator = validator("https://short.example.com")

        assertThrows<ApplicationException> {
            validator.validateUrl("http://169.254.169.254/latest/meta-data")
        }
    }

    @Test
    fun `non http schemes are rejected`() {
        val validator = validator("https://short.example.com")

        assertThrows<ApplicationException> {
            validator.validateUrl("file:///etc/passwd")
        }
    }

    @Test
    fun `ipv6 unique local addresses are rejected`() {
        val validator = validator("https://short.example.com")

        assertThrows<ApplicationException> {
            validator.validateUrl("https://[fc00::1]/internal")
        }
    }

    @Test
    fun `ipv6 documentation addresses are rejected`() {
        val validator = validator("https://short.example.com")

        assertThrows<ApplicationException> {
            validator.validateUrl("https://[2001:db8::1]/example")
        }
    }

    @Test
    fun `urls with embedded credentials are rejected`() {
        val validator = validator("https://short.example.com")

        assertThrows<ApplicationException> {
            validator.validateUrl("https://user:secret@example.com/path")
        }
    }

    @Test
    fun `domains resolving to private addresses are rejected`() {
        val validator = validator(
            "https://short.example.com",
            resolver = stubResolver("internal.example" to listOf("192.168.1.10"))
        )

        assertThrows<ApplicationException> {
            validator.validateUrl("https://internal.example/path")
        }
    }

    @Test
    fun `public ipv4 addresses are accepted`() {
        val validator = validator("https://short.example.com")

        assertDoesNotThrow {
            validator.validateUrl("https://93.184.216.34/path")
        }
    }

    private fun validator(
        baseUrl: String,
        blockedHostnames: String = "",
        resolver: HostResolver = stubResolver()
    ): UrlValidator =
        UrlValidator(baseUrl, blockedHostnames, resolver)

    private fun stubResolver(vararg entries: Pair<String, List<String>>) = HostResolver { host ->
        val mappedAddresses = entries.toMap()[host]
        val values = mappedAddresses ?: listOf(host)
        values.map(InetAddress::getByName)
    }
}
