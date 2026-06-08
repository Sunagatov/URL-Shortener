package com.zufar.urlshortener.shared.logging

import kotlin.test.Test
import kotlin.test.assertEquals

class LogSanitizerTest {

    @Test
    fun `masks email while keeping domain searchable`() {
        assertEquals("ab***@example.com", LogSanitizer.maskEmail("Abcdef@example.com"))
        assertEquals("example.com", LogSanitizer.emailDomain("Abcdef@example.com"))
    }

    @Test
    fun `extracts only host from url`() {
        assertEquals("example.com", LogSanitizer.safeUrlHost("https://example.com/reset?token=secret"))
        assertEquals("invalid", LogSanitizer.safeUrlHost("not a url"))
    }

    @Test
    fun `replaces line breaks in log values`() {
        assertEquals("203.0.113.5__subject", LogSanitizer.safeLogValue("203.0.113.5\r\nsubject"))
        assertEquals("unknown", LogSanitizer.safeLogValue(" "))
    }
}
