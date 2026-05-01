package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.auth.api.AuthenticatedUserContext
import com.zufar.urlshortener.auth.api.UserAccount
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.validation.ChangePasswordValidator
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.eq
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Clock
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UserPasswordChangerTest {

    @Mock private lateinit var authenticatedUserContext: AuthenticatedUserContext
    @Mock private lateinit var passwordEncoder: PasswordEncoder
    @Mock private lateinit var changePasswordValidator: ChangePasswordValidator
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    @Test
    fun `changePassword updates the authenticated users password`() {
        val user = UserAccount(
            id = "user-1",
            firstName = "Test",
            lastName = "User",
            email = "user@example.com",
            passwordHash = "old-hash",
            country = "USA",
            age = 30,
            createdAt = LocalDateTime.of(2024, 1, 1, 9, 0),
            tokenVersion = 0
        )
        whenever(authenticatedUserContext.requireAuthenticatedUser()).thenReturn(user)
        whenever(passwordEncoder.matches("OldPassword1!", "old-hash")).thenReturn(true)
        whenever(passwordEncoder.encode("NewPassword1!")).thenReturn("new-hash")

        UserAccountService(
            authenticatedUserContext,
            passwordEncoder,
            changePasswordValidator,
            clock
        ).changePassword(
            ChangePasswordRequest(
                currentPassword = "OldPassword1!",
                newPassword = "NewPassword1!"
            )
        )

        verify(changePasswordValidator).validate(any())
        verify(authenticatedUserContext).updatePassword(argThat {
            assertEquals("user@example.com", email)
            assertEquals(0, tokenVersion)
            true
        }, eq("new-hash"), eq(LocalDateTime.of(2024, 1, 1, 10, 15, 30)))
    }

    @Test
    fun `changePassword rejects an invalid current password`() {
        val user = UserAccount(
            id = "user-1",
            firstName = "Test",
            lastName = "User",
            email = "user@example.com",
            passwordHash = "old-hash",
            country = "USA",
            age = 30,
            createdAt = LocalDateTime.of(2024, 1, 1, 9, 0),
            tokenVersion = 0
        )
        whenever(authenticatedUserContext.requireAuthenticatedUser()).thenReturn(user)
        whenever(passwordEncoder.matches("WrongPassword1!", "old-hash")).thenReturn(false)

        assertThrows<InvalidRequestException> {
            UserAccountService(
                authenticatedUserContext,
                passwordEncoder,
                changePasswordValidator,
                clock
            ).changePassword(
                ChangePasswordRequest(
                    currentPassword = "WrongPassword1!",
                    newPassword = "NewPassword1!"
                )
            )
        }

        verify(authenticatedUserContext, never()).updatePassword(any(), any(), any())
    }
}
