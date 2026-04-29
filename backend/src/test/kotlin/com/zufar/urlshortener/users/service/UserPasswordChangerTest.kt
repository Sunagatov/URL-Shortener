package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.auth.entity.UserDetails
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.CurrentUserProvider
import com.zufar.urlshortener.auth.service.validator.AuthRequestValidator
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.security.authentication.TestingAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UserPasswordChangerTest {

    @Mock private lateinit var userRepository: UserRepository
    @Mock private lateinit var passwordEncoder: PasswordEncoder
    @Mock private lateinit var authRequestValidator: AuthRequestValidator
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    @AfterEach
    fun tearDown() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `changePassword updates the authenticated users password`() {
        val user = UserDetails(
            id = "user-1",
            firstName = "Test",
            lastName = "User",
            email = "user@example.com",
            password = "old-hash",
            country = "USA",
            age = 30
        )
        SecurityContextHolder.getContext().authentication =
            TestingAuthenticationToken("  User@Example.COM  ", null)
        whenever(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)
        whenever(passwordEncoder.matches("OldPassword1!", "old-hash")).thenReturn(true)
        whenever(passwordEncoder.encode("NewPassword1!")).thenReturn("new-hash")

        UserPasswordChanger(
            userRepository,
            passwordEncoder,
            authRequestValidator,
            CurrentUserProvider(userRepository),
            clock
        ).changePassword(
            ChangePasswordRequest(
                currentPassword = "OldPassword1!",
                newPassword = "NewPassword1!"
            )
        )

        verify(authRequestValidator).validateChangePasswordRequest(any())
        verify(userRepository).save(argThat {
            assertEquals("new-hash", password)
            assertEquals("user@example.com", email)
            assertEquals(1, tokenVersion)
            assertEquals("2024-01-01T10:15:30", updatedAt.toString())
            true
        })
    }

    @Test
    fun `changePassword rejects an invalid current password`() {
        val user = UserDetails(
            id = "user-1",
            firstName = "Test",
            lastName = "User",
            email = "user@example.com",
            password = "old-hash",
            country = "USA",
            age = 30
        )
        SecurityContextHolder.getContext().authentication =
            TestingAuthenticationToken("user@example.com", null)
        whenever(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)
        whenever(passwordEncoder.matches("WrongPassword1!", "old-hash")).thenReturn(false)

        assertThrows<InvalidRequestException> {
            UserPasswordChanger(
                userRepository,
                passwordEncoder,
                authRequestValidator,
                CurrentUserProvider(userRepository),
                clock
            ).changePassword(
                ChangePasswordRequest(
                    currentPassword = "WrongPassword1!",
                    newPassword = "NewPassword1!"
                )
            )
        }

        verify(userRepository, never()).save(any())
    }
}
