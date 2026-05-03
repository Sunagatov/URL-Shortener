package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.ForgotPasswordRequest
import com.zufar.urlshortener.auth.dto.ResetPasswordRequest
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.users.entity.AuthProvider
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

@ExtendWith(MockitoExtension::class)
class PasswordResetServiceTest {

    @Mock private lateinit var userAccountRepository: UserAccountRepository
    @Mock private lateinit var passwordEncoder: PasswordEncoder
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    private fun service() = PasswordResetService(userAccountRepository, passwordEncoder, clock)

    @Test
    fun `requestReset generates token and saves hash for local user`() {
        val user = localUser()
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)
        whenever(passwordEncoder.encode(any<String>())).thenReturn("hashed-token")
        whenever(userAccountRepository.save(any<UserAccountDocument>())).thenAnswer { it.arguments[0] }

        service().requestReset(ForgotPasswordRequest("user@example.com"))

        val captor = argumentCaptor<UserAccountDocument>()
        verify(userAccountRepository).save(captor.capture())
        assertEquals("hashed-token", captor.firstValue.passwordResetTokenHash)
        assertNotNull(captor.firstValue.passwordResetTokenId)
        assertNotNull(captor.firstValue.passwordResetTokenExpiresAt)
    }

    @Test
    fun `requestReset silently succeeds for unknown email`() {
        whenever(userAccountRepository.findByEmailIgnoreCase("unknown@example.com")).thenReturn(null)

        assertDoesNotThrow { service().requestReset(ForgotPasswordRequest("unknown@example.com")) }
        verify(userAccountRepository, never()).save(any())
    }

    @Test
    fun `requestReset skips Google-only user without password`() {
        val googleUser = UserAccountDocument(
            id = "g-1", firstName = "G", lastName = "User", email = "g@example.com",
            authProvider = AuthProvider.GOOGLE, password = null
        )
        whenever(userAccountRepository.findByEmailIgnoreCase("g@example.com")).thenReturn(googleUser)

        assertDoesNotThrow { service().requestReset(ForgotPasswordRequest("g@example.com")) }
        verify(userAccountRepository, never()).save(any())
    }

    @Test
    fun `resetPassword updates password and increments tokenVersion`() {
        val user = localUser().copy(
            passwordResetTokenHash = "hashed-token",
            passwordResetTokenId = "abcdefghijklmnop",
            passwordResetTokenExpiresAt = Instant.parse("2024-01-01T10:30:00Z"),
            tokenVersion = 3
        )
        whenever(userAccountRepository.findByPasswordResetTokenId("abcdefghijklmnop")).thenReturn(user)
        whenever(passwordEncoder.matches(any<String>(), any<String>())).thenReturn(true)
        whenever(passwordEncoder.encode("NewSecurePassword1")).thenReturn("new-hashed-pw")
        whenever(userAccountRepository.save(any<UserAccountDocument>())).thenAnswer { it.arguments[0] }

        service().resetPassword(ResetPasswordRequest("abcdefghijklmnopQRSTUVWXYZ123456", "NewSecurePassword1"))

        val captor = argumentCaptor<UserAccountDocument>()
        verify(userAccountRepository).save(captor.capture())
        assertEquals("new-hashed-pw", captor.firstValue.password)
        assertEquals(4, captor.firstValue.tokenVersion)
        assertNull(captor.firstValue.passwordResetTokenHash)
        assertNull(captor.firstValue.passwordResetTokenId)
        assertNull(captor.firstValue.passwordResetTokenExpiresAt)
    }

    @Test
    fun `resetPassword rejects expired token`() {
        val user = localUser().copy(
            passwordResetTokenHash = "hashed-token",
            passwordResetTokenId = "abcdefghijklmnop",
            passwordResetTokenExpiresAt = Instant.parse("2024-01-01T10:00:00Z") // before clock time
        )
        whenever(userAccountRepository.findByPasswordResetTokenId("abcdefghijklmnop")).thenReturn(user)

        val ex = assertThrows<ApplicationException> {
            service().resetPassword(ResetPasswordRequest("abcdefghijklmnopQRSTUVWXYZ123456", "NewSecurePassword1"))
        }
        assertEquals("INVALID_RESET_TOKEN", ex.code)
    }

    @Test
    fun `resetPassword rejects invalid token hash`() {
        val user = localUser().copy(
            passwordResetTokenHash = "hashed-token",
            passwordResetTokenId = "abcdefghijklmnop",
            passwordResetTokenExpiresAt = Instant.parse("2024-01-01T10:30:00Z")
        )
        whenever(userAccountRepository.findByPasswordResetTokenId("abcdefghijklmnop")).thenReturn(user)
        whenever(passwordEncoder.matches(any<String>(), any<String>())).thenReturn(false)

        val ex = assertThrows<ApplicationException> {
            service().resetPassword(ResetPasswordRequest("abcdefghijklmnopWRONG_TOKEN_HERE", "NewSecurePassword1"))
        }
        assertEquals("INVALID_RESET_TOKEN", ex.code)
    }

    @Test
    fun `resetPassword rejects unknown tokenId`() {
        whenever(userAccountRepository.findByPasswordResetTokenId(any())).thenReturn(null)

        val ex = assertThrows<ApplicationException> {
            service().resetPassword(ResetPasswordRequest("unknowntokenid__RESTOFTOKEN12345", "NewSecurePassword1"))
        }
        assertEquals("INVALID_RESET_TOKEN", ex.code)
    }

    @Test
    fun `requestReset normalizes email`() {
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(null)

        service().requestReset(ForgotPasswordRequest("  User@Example.COM  "))

        verify(userAccountRepository).findByEmailIgnoreCase("user@example.com")
    }

    private fun localUser() = UserAccountDocument(
        id = "user-1", firstName = "User", lastName = "Test",
        email = "user@example.com", password = "hashed-pw",
        authProvider = AuthProvider.LOCAL, tokenVersion = 0
    )
}
