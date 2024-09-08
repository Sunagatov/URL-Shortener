package com.zufar.urlshortener.encoder

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class StringEncoderTest {

    @Test
    fun `encode should convert string to base-58 encoded string`() {
        val input = "https://example.com"
        val encoded = StringEncoder.encode(input)

        assertNotNull(encoded)
        assertTrue(encoded.isNotEmpty())

        val base58Regex = Regex("^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$")
        assertTrue(encoded.matches(base58Regex), "Encoded string is not in Base-58 format")
    }

    @Test
    fun `encode should produce consistent results for the same input`() {
        val input = "https://example.com"
        val firstEncoded = StringEncoder.encode(input)
        val secondEncoded = StringEncoder.encode(input)

        assertEquals(firstEncoded, secondEncoded, "Encoding is not consistent")
    }
}
