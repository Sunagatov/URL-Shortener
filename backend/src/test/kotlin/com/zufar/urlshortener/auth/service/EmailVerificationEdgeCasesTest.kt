package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.ResendVerificationRequest
import com.zufar.urlshortener.auth.dto.VerifyEmailRequest
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Clock
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class EmailVerificationEdgeCasesTest {

    @Mock private lateinit var userAccountRepository: UserAccountRepository
    @Mock private lateinit var passwordEncoder: PasswordEncoder
    @Mock private lateinit var emailVerificationNotifier: EmailVerificationNotifier
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    private fun workflow(enabled: Boolean = true) = EmailVerificationWorkflow(
        userAccountRepository = userAccountRepository,
        passwordEncoder = passwordEncoder,
        emailVerificationNotifier = emailVerificationNotifier,
        emailVerificationEnabled = enabled,
        verificationExpirationMinutes = 10,
        verificationResendCooldownSeconds = 60,
        clock = clock
    )

    @Test
    fun `verifyEmail rejects expired verification code`() {
        val user = unverifiedUser().copy(
            emailVerificationCodeExpiresAt = LocalDateTime.of(2024, 1, 1, 10, 10, 0) // before clock
        )
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)

        val ex = assertThrows<ApplicationException> {
            workflow().verifyEmail(VerifyEmailRequest("user@example.com", "123456"))
        }
        assertEquals("INVALID_VERIFICATION_CODE", ex.code)
    }

    @Test
    fun `verifyEmail rejects already-verified user`() {
        val user = unverifiedUser().copy(emailVerified = true)
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)

        val ex = assertThrows<ApplicationException> {
            workflow().verifyEmail(VerifyEmailRequest("user@example.com", "123456"))
        }
        assertEquals("INVALID_AUTH_REQUEST", ex.code)
    }

    @Test
    fun `verifyEmail rejects when user not found`() {
        whenever(userAccountRepository.findByEmailIgnoreCase("gone@example.com")).thenReturn(null)

        val ex = assertThrows<ApplicationException> {
            workflow().verifyEmail(VerifyEmailRequest("gone@example.com", "123456"))
        }
        assertEquals("USER_NOT_FOUND", ex.code)
    }

    @Test
    fun `verifyEmail rejects when code hash is null`() {
        val user = unverifiedUser().copy(emailVerificationCodeHash = null)
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)

        val ex = assertThrows<ApplicationException> {
            workflow().verifyEmail(VerifyEmailRequest("user@example.com", "123456"))
        }
        assertEquals("INVALID_VERIFICATION_CODE", ex.code)
    }

    @Test
    fun `verifyEmail rejects when expiration is null`() {
        val user = unverifiedUser().copy(emailVerificationCodeExpiresAt = null)
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)

        val ex = assertThrows<ApplicationException> {
            workflow().verifyEmail(VerifyEmailRequest("user@example.com", "123456"))
        }
        assertEquals("INVALID_VERIFICATION_CODE", ex.code)
    }

    @Test
    fun `resendVerificationCode rejects already-verified user`() {
        val user = unverifiedUser().copy(emailVerified = true)
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)

        val ex = assertThrows<ApplicationException> {
            workflow().resendVerificationCode(ResendVerificationRequest("user@example.com"))
        }
        assertEquals("INVALID_AUTH_REQUEST", ex.code)
    }

    @Test
    fun `resendVerificationCode rejects when user not found`() {
        whenever(userAccountRepository.findByEmailIgnoreCase("gone@example.com")).thenReturn(null)

        val ex = assertThrows<ApplicationException> {
            workflow().resendVerificationCode(ResendVerificationRequest("gone@example.com"))
        }
        assertEquals("USER_NOT_FOUND", ex.code)
    }

    @Test
    fun `verifyEmail and resendVerificationCode throw when verification disabled`() {
        val ex1 = assertThrows<ApplicationException> {
            workflow(enabled = false).verifyEmail(VerifyEmailRequest("user@example.com", "123456"))
        }
        assertEquals("INVALID_AUTH_REQUEST", ex1.code)

        val ex2 = assertThrows<ApplicationException> {
            workflow(enabled = false).resendVerificationCode(ResendVerificationRequest("user@example.com"))
        }
        assertEquals("INVALID_AUTH_REQUEST", ex2.code)
    }

    @Test
    fun `resendVerificationCode at exact cooldown boundary allows resend`() {
        // sentAt + 60s == now → remaining cooldown is 0 → should allow
        val user = unverifiedUser().copy(
            emailVerificationCodeSentAt = LocalDateTime.of(2024, 1, 1, 10, 14, 30)
        )
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)
        whenever(passwordEncoder.encode(org.mockito.kotlin.any<String>())).thenReturn("new-hash")
        whenever(userAccountRepository.save(org.mockito.kotlin.any<UserAccountDocument>())).thenAnswer { it.arguments[0] }
        whenever(emailVerificationNotifier.sendCode(org.mockito.kotlin.any(), org.mockito.kotlin.any(), org.mockito.kotlin.any())).thenReturn("log")

        val response = workflow().resendVerificationCode(ResendVerificationRequest("user@example.com"))
        assertEquals("user@example.com", response.email)
    }

    @Test
    fun `createChallenge generates 6-digit zero-padded code`() {
        val fixedRandom = java.security.SecureRandom.getInstance("SHA1PRNG").apply { setSeed(byteArrayOf(0)) }
        val wf = EmailVerificationWorkflow(
            userAccountRepository = userAccountRepository,
            passwordEncoder = passwordEncoder,
            emailVerificationNotifier = emailVerificationNotifier,
            emailVerificationEnabled = true,
            verificationExpirationMinutes = 10,
            verificationResendCooldownSeconds = 60,
            clock = clock,
            random = fixedRandom
        )
        whenever(passwordEncoder.encode(org.mockito.kotlin.any<String>())).thenReturn("hash")

        val (_, code) = wf.createChallenge(unverifiedUser(), LocalDateTime.now(clock))
        assertEquals(6, code.length)
        assert(code.all { it.isDigit() })
    }

    private fun unverifiedUser() = UserAccountDocument(
        id = "user-1", firstName = "User", lastName = "Test",
        email = "user@example.com", password = "hashed",
        emailVerified = false,
        emailVerificationCodeHash = "verification-hash",
        emailVerificationCodeExpiresAt = LocalDateTime.of(2024, 1, 1, 10, 25, 30),
        emailVerificationCodeSentAt = LocalDateTime.of(2024, 1, 1, 10, 15, 30)
    )
}
