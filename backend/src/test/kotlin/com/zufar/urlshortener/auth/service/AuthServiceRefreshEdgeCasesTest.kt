package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class AuthServiceRefreshEdgeCasesTest {

    @Mock private lateinit var authenticationManager: AuthenticationManager
    @Mock private lateinit var jwtTokenProvider: JwtTokenProvider
    @Mock private lateinit var userAccountRepository: UserAccountRepository
    @Mock private lateinit var passwordEncoder: PasswordEncoder
    @Mock private lateinit var emailVerificationNotifier: EmailVerificationNotifier
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    private fun authService() = AuthService(
        authenticationManager = authenticationManager,
        userAccountRepository = userAccountRepository,
        passwordEncoder = passwordEncoder,
        jwtTokenProvider = jwtTokenProvider,
        emailVerificationNotifier = emailVerificationNotifier,
        emailVerificationEnabled = true,
        verificationExpirationMinutes = 10,
        verificationResendCooldownSeconds = 60,
        clock = clock
    )

    @Test
    fun `refreshAccessToken rejects invalid refresh token`() {
        whenever(jwtTokenProvider.validateRefreshToken("bad-token")).thenReturn(false)

        val ex = assertThrows<ApplicationException> {
            authService().refreshAccessToken(RefreshTokenRequest("bad-token"))
        }
        assertEquals("INVALID_TOKEN", ex.code)
    }

    @Test
    fun `refreshAccessToken rejects when user not found`() {
        whenever(jwtTokenProvider.validateRefreshToken("valid-token")).thenReturn(true)
        whenever(jwtTokenProvider.getUsernameFromJWT("valid-token")).thenReturn("gone@example.com")
        whenever(userAccountRepository.findByEmailIgnoreCase("gone@example.com")).thenReturn(null)

        val ex = assertThrows<ApplicationException> {
            authService().refreshAccessToken(RefreshTokenRequest("valid-token"))
        }
        assertEquals("USER_NOT_FOUND", ex.code)
    }

    @Test
    fun `refreshAccessToken rejects when token version is null`() {
        val user = com.zufar.urlshortener.users.entity.UserAccountDocument(
            id = "u-1", firstName = "U", lastName = "T", email = "user@example.com",
            password = "hashed", tokenVersion = 0
        )
        whenever(jwtTokenProvider.validateRefreshToken("valid-token")).thenReturn(true)
        whenever(jwtTokenProvider.getUsernameFromJWT("valid-token")).thenReturn("user@example.com")
        whenever(jwtTokenProvider.getTokenVersionFromJWT("valid-token")).thenReturn(null)
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)

        val ex = assertThrows<ApplicationException> {
            authService().refreshAccessToken(RefreshTokenRequest("valid-token"))
        }
        assertEquals("INVALID_TOKEN", ex.code)
    }
}
