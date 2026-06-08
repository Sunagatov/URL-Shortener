package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.security.AuthenticatedUserIdProvider
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.*
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UserPasswordChangerTest {

    @Mock private lateinit var authenticatedUserIdProvider: AuthenticatedUserIdProvider
    @Mock private lateinit var userAccountRepository: UserAccountRepository
    @Mock private lateinit var passwordEncoder: PasswordEncoder
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    @Test
    fun `changePassword updates the authenticated users password`() {
        val user = UserAccountDocument(
            id = "user-1",
            firstName = "Test",
            lastName = "User",
            email = "user@example.com",
            password = "old-hash",
            country = "USA",
            age = 30,
            createdAt = Instant.parse("2024-01-01T09:00:00Z"),
            tokenVersion = 4
        )
        whenever(authenticatedUserIdProvider.requireAuthenticatedUserId()).thenReturn("user-1")
        whenever(userAccountRepository.findById("user-1")).thenReturn(Optional.of(user))
        whenever(passwordEncoder.matches("OldPassword1!", "old-hash")).thenReturn(true)
        whenever(passwordEncoder.encode("NewPassword1!")).thenReturn("new-hash")
        whenever(userAccountRepository.save(any<UserAccountDocument>())).thenAnswer { it.arguments[0] }

        UserAccountService(
            authenticatedUserIdProvider,
            userAccountRepository,
            passwordEncoder,
            clock
        ).changePassword(
            ChangePasswordRequest(
                currentPassword = "OldPassword1!",
                newPassword = "NewPassword1!"
            )
        )

        verify(userAccountRepository).save(argThat {
            password == "new-hash" &&
                tokenVersion == 5 &&
                updatedAt == Instant.parse("2024-01-01T10:15:30Z")
        })
    }

    @Test
    fun `changePassword rejects an invalid current password`() {
        val user = UserAccountDocument(
            id = "user-1",
            firstName = "Test",
            lastName = "User",
            email = "user@example.com",
            password = "old-hash",
            country = "USA",
            age = 30,
            createdAt = Instant.parse("2024-01-01T09:00:00Z"),
            tokenVersion = 0
        )
        whenever(authenticatedUserIdProvider.requireAuthenticatedUserId()).thenReturn("user-1")
        whenever(userAccountRepository.findById("user-1")).thenReturn(Optional.of(user))
        whenever(passwordEncoder.matches("WrongPassword1!", "old-hash")).thenReturn(false)

        val ex = assertThrows<ApplicationException> {
            UserAccountService(
                authenticatedUserIdProvider,
                userAccountRepository,
                passwordEncoder,
                clock
            ).changePassword(
                ChangePasswordRequest(
                    currentPassword = "WrongPassword1!",
                    newPassword = "NewPassword1!"
                )
            )
        }
        assertEquals("INVALID_USER_REQUEST", ex.code)

        verify(userAccountRepository, never()).save(any<UserAccountDocument>())
    }
}
