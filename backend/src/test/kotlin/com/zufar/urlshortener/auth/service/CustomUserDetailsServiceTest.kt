package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.security.CustomUserDetailsService
import com.zufar.urlshortener.users.api.UserAccountRecord
import com.zufar.urlshortener.users.api.UserAuthStore
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class CustomUserDetailsServiceTest {

    @Mock private lateinit var userAuthStore: UserAuthStore

    private fun service() = CustomUserDetailsService(userAuthStore)

    @Test
    fun `loadUserByUsername resolves mixed-case email input`() {
        whenever(userAuthStore.findByEmailIgnoreCase("user@example.com")).thenReturn(user())

        val result = service().loadUserByUsername("User@Example.COM")

        verify(userAuthStore).findByEmailIgnoreCase("user@example.com")
        assertEquals("user@example.com", result.username)
    }

    @Test
    fun `loadUserByUsername resolves trimmed email input`() {
        whenever(userAuthStore.findByEmailIgnoreCase("user@example.com")).thenReturn(user())

        val result = service().loadUserByUsername("  user@example.com  ")

        verify(userAuthStore).findByEmailIgnoreCase("user@example.com")
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
