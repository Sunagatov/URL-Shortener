package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.security.CustomUserDetailsService
import com.zufar.urlshortener.users.api.UserAccountRecord
import com.zufar.urlshortener.users.api.UserCredentialsReader
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class CustomUserDetailsServiceTest {

    @Mock private lateinit var userCredentialsReader: UserCredentialsReader

    private fun service() = CustomUserDetailsService(userCredentialsReader)

    @Test
    fun `loadUserByUsername resolves mixed-case email input`() {
        whenever(userCredentialsReader.findByEmailIgnoreCase("user@example.com")).thenReturn(user())

        val result = service().loadUserByUsername("User@Example.COM")

        verify(userCredentialsReader).findByEmailIgnoreCase("user@example.com")
        assertEquals("user@example.com", result.username)
    }

    @Test
    fun `loadUserByUsername resolves trimmed email input`() {
        whenever(userCredentialsReader.findByEmailIgnoreCase("user@example.com")).thenReturn(user())

        val result = service().loadUserByUsername("  user@example.com  ")

        verify(userCredentialsReader).findByEmailIgnoreCase("user@example.com")
        assertEquals("user@example.com", result.username)
    }

    private fun user() = UserAccountRecord(
        firstName = "User",
        lastName = "Test",
        email = "user@example.com",
        password = "hashed",
        country = "USA",
        age = 30
    )
}
