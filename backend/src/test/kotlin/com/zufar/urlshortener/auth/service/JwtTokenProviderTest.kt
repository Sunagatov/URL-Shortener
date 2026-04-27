package com.zufar.urlshortener.auth.service

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class JwtTokenProviderTest {

    private val validSecret = "a-valid-secret-key-that-is-at-least-32-bytes-long"
    private val accessExpiry = 3_600_000L
    private val refreshExpiry = 604_800_000L

    @Test
    fun `secret shorter than 32 bytes throws IllegalArgumentException at construction`() {
        assertThrows<IllegalArgumentException> {
            JwtTokenProvider("short-secret", accessExpiry, refreshExpiry)
        }
    }

    @Test
    fun `empty secret throws IllegalArgumentException at construction`() {
        assertThrows<IllegalArgumentException> {
            JwtTokenProvider("", accessExpiry, refreshExpiry)
        }
    }

    @Test
    fun `valid secret constructs successfully`() {
        val provider = JwtTokenProvider(validSecret, accessExpiry, refreshExpiry)
        assertNotNull(provider)
    }

    @Test
    fun `generated access token validates as access type`() {
        val provider = JwtTokenProvider(validSecret, accessExpiry, refreshExpiry)
        val userDetails = org.springframework.security.core.userdetails.User("user@test.com", "pw", emptyList())

        val token = provider.generateAccessToken(userDetails)

        assertTrue(provider.validateAccessToken(token))
    }

    @Test
    fun `access token is rejected as refresh token`() {
        val provider = JwtTokenProvider(validSecret, accessExpiry, refreshExpiry)
        val userDetails = org.springframework.security.core.userdetails.User("user@test.com", "pw", emptyList())

        val token = provider.generateAccessToken(userDetails)

        assertTrue(!provider.validateRefreshToken(token))
    }

    @Test
    fun `generated refresh token validates as refresh type`() {
        val provider = JwtTokenProvider(validSecret, accessExpiry, refreshExpiry)
        val userDetails = org.springframework.security.core.userdetails.User("user@test.com", "pw", emptyList())

        val token = provider.generateRefreshToken(userDetails)

        assertTrue(provider.validateRefreshToken(token))
    }
}
