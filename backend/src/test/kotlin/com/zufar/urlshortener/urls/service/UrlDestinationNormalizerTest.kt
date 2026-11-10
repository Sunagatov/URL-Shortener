package com.zufar.urlshortener.urls.service

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class UrlDestinationNormalizerTest {
    @Test
    fun `normalizes scheme and Unicode host preserving raw URL components`() {
        assertEquals("https://xn--bcher-kva.de:8443/path?x=%2F#Part",
            UrlDestinationNormalizer.normalize("HTTPS://BÜCHER.de:8443/path?x=%2F#Part"))
    }

    @Test
    fun `encodes Unicode path without double encoding existing escapes`() {
        assertEquals("https://example.com/caf%C3%A9?x=%2F#Part",
            UrlDestinationNormalizer.normalize("HTTPS://EXAMPLE.COM/café?x=%2F#Part"))
    }

    @Test
    fun `retains IPv6 authority and port`() {
        assertEquals("https://[2606:4700:4700::1111]:8443/a",
            UrlDestinationNormalizer.normalize("HTTPS://[2606:4700:4700::1111]:8443/a"))
    }

    @Test
    fun `does not silently map sharp s to another domain`() {
        assertEquals("https://faß.de/a", UrlDestinationNormalizer.normalize("https://faß.de/a"))
        assertEquals("https://xn--fa-hia.de/a", UrlDestinationNormalizer.normalize("https://xn--fa-hia.de/a"))
    }

    @Test
    fun `does not strip credentials or repair malformed authorities`() {
        for (value in listOf("https://user:secret@example.com/a", "https://example.com:bad/a", "not a URL")) {
            assertEquals(value, UrlDestinationNormalizer.normalize(value))
        }
    }
}
