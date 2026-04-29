package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.auth.security.withTokenVersion
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.core.userdetails.User
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertEquals
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
        val userDetails = User("user@test.com", "pw", emptyList()).withTokenVersion(3)

        val token = provider.generateAccessToken(userDetails)

        assertTrue(provider.validateAccessToken(token))
        assertEquals("user@test.com", provider.getUsernameFromValidAccessToken(token))
        assertEquals(3, provider.getTokenVersionFromJWT(token))
    }

    @Test
    fun `access token is rejected as refresh token`() {
        val provider = JwtTokenProvider(validSecret, accessExpiry, refreshExpiry)
        val userDetails = User("user@test.com", "pw", emptyList()).withTokenVersion(1)

        val token = provider.generateAccessToken(userDetails)

        assertTrue(!provider.validateRefreshToken(token))
    }

    @Test
    fun `generated refresh token validates as refresh type`() {
        val provider = JwtTokenProvider(validSecret, accessExpiry, refreshExpiry)
        val userDetails = User("user@test.com", "pw", emptyList()).withTokenVersion(7)

        val token = provider.generateRefreshToken(userDetails)

        assertTrue(provider.validateRefreshToken(token))
        assertEquals(7, provider.getTokenVersionFromJWT(token))
        assertNull(provider.getUsernameFromValidAccessToken(token))
    }
}
