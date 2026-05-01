package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.security.CustomUserDetailsService
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class CustomUserDetailsServiceTest {

    @Mock private lateinit var userAccountRepository: UserAccountRepository

    private fun service() = CustomUserDetailsService(userAccountRepository)

    @Test
    fun `loadUserByUsername resolves mixed-case email input`() {
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user())

        val result = service().loadUserByUsername("User@Example.COM")

        verify(userAccountRepository).findByEmailIgnoreCase("user@example.com")
        assertEquals("user@example.com", result.username)
    }

    @Test
    fun `loadUserByUsername resolves trimmed email input`() {
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user())

        val result = service().loadUserByUsername("  user@example.com  ")

        verify(userAccountRepository).findByEmailIgnoreCase("user@example.com")
        assertEquals("user@example.com", result.username)
    }

    private fun user() = UserAccountDocument(
        firstName = "User",
        lastName = "Test",
        email = "user@example.com",
        password = "hashed",
        country = "USA",
        age = 30
    )
}
