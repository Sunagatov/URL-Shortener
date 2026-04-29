package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.entity.UserDetails
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.security.CustomUserDetailsService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class CustomUserDetailsServiceTest {

    @Mock private lateinit var userRepository: UserRepository

    private fun service() = CustomUserDetailsService(userRepository)

    @Test
    fun `loadUserByUsername resolves mixed-case email input`() {
        whenever(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user())

        val result = service().loadUserByUsername("User@Example.COM")

        verify(userRepository).findByEmailIgnoreCase("user@example.com")
        assertEquals("user@example.com", result.username)
    }

    @Test
    fun `loadUserByUsername resolves trimmed email input`() {
        whenever(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user())

        val result = service().loadUserByUsername("  user@example.com  ")

        verify(userRepository).findByEmailIgnoreCase("user@example.com")
        assertEquals("user@example.com", result.username)
    }

    private fun user() = UserDetails(
        firstName = "User",
        lastName = "Test",
        email = "user@example.com",
        password = "hashed",
        country = "USA",
        age = 30
    )
}
