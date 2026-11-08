package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.security.AccountPasswordEncoder
import org.junit.jupiter.api.Test
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import kotlin.test.*

class AccountPasswordEncoderTest {
    private val encoder = AccountPasswordEncoder()

    @Test
    fun `long Unicode passwords remain distinct beyond bcrypt byte limit`() {
        val password = "ж".repeat(40)
        val hash = encoder.encode(password)
        assertTrue(hash.startsWith("{argon2id-nfc}"))
        assertTrue(encoder.matches(password, hash))
        assertFalse(encoder.matches("ж".repeat(39) + "я", hash))
        assertFalse(encoder.matches("ж".repeat(36), hash))
        assertFalse(encoder.upgradeEncoding(hash))
    }

    @Test
    fun `legacy bcrypt passwords and outstanding challenges remain readable`() {
        val password = "existing password 2026"
        val legacy = BCryptPasswordEncoder().encode(password)!!
        assertTrue(encoder.matches(password, legacy))
        assertTrue(encoder.matches(password, "{bcrypt}$legacy"))
        assertTrue(encoder.upgradeEncoding(legacy))
        assertFalse(encoder.matches("wrong password", legacy))
        assertFalse(encoder.matches("ж".repeat(40), legacy))
        assertFalse(encoder.matches(null, legacy))
        assertFalse(encoder.matches(password, "{unknown}invalid"))
    }
}
