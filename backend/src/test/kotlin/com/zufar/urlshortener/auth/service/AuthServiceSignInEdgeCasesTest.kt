package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.users.entity.AuthProvider
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class AuthServiceSignInEdgeCasesTest {

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
    fun `signIn rejects Google-only account`() {
        val googleUser = UserAccountDocument(
            id = "g-1", firstName = "G", lastName = "User", email = "g@example.com",
            authProvider = AuthProvider.GOOGLE, password = null
        )
        whenever(userAccountRepository.findByEmailIgnoreCase("g@example.com")).thenReturn(googleUser)

        val ex = assertThrows<ApplicationException> {
            authService().signIn(SignInRequest("g@example.com", "password"))
        }
        assertEquals("GOOGLE_ONLY_ACCOUNT", ex.code)
    }

    @Test
    fun `signIn propagates BadCredentialsException from AuthenticationManager`() {
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(
            UserAccountDocument(
                id = "u-1", firstName = "U", lastName = "T", email = "user@example.com",
                password = "hashed", authProvider = AuthProvider.LOCAL
            )
        )
        whenever(authenticationManager.authenticate(org.mockito.kotlin.any()))
            .thenThrow(BadCredentialsException("Bad credentials"))

        assertThrows<BadCredentialsException> {
            authService().signIn(SignInRequest("user@example.com", "wrong-password"))
        }
    }

    @Test
    fun `signIn allows local user with password even if Google-linked`() {
        val linkedUser = UserAccountDocument(
            id = "u-1", firstName = "U", lastName = "T", email = "user@example.com",
            password = "hashed", authProvider = AuthProvider.GOOGLE
        )
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(linkedUser)

        // Should NOT throw GOOGLE_ONLY_ACCOUNT because password is not null
        // Will throw BadCredentialsException from auth manager instead
        whenever(authenticationManager.authenticate(org.mockito.kotlin.any()))
            .thenThrow(BadCredentialsException("Bad credentials"))

        assertThrows<BadCredentialsException> {
            authService().signIn(SignInRequest("user@example.com", "wrong"))
        }
    }
}
