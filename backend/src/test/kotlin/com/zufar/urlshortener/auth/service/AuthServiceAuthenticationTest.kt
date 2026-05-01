package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.auth.security.withTokenVersion
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails as SecurityUserDetails
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class AuthServiceAuthenticationTest {

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
    fun `authenticate passes normalized email to authentication manager`() {
        val principal: SecurityUserDetails = User("user@example.com", "hashed", emptyList())
            .withTokenVersion(0, "user-1", true)
        whenever(authenticationManager.authenticate(any())).thenReturn(
            UsernamePasswordAuthenticationToken(principal, null, principal.authorities)
        )
        whenever(jwtTokenProvider.generateAccessToken(principal)).thenReturn("access-token")
        whenever(jwtTokenProvider.generateRefreshToken(principal)).thenReturn("refresh-token")

        authService().signIn(SignInRequest("  User@Example.COM  ", "password"))

        val captor = argumentCaptor<UsernamePasswordAuthenticationToken>()
        verify(authenticationManager).authenticate(captor.capture())
        assertEquals("user@example.com", captor.firstValue.principal)
    }

    @Test
    fun `sign in rejects unverified users`() {
        val principal: SecurityUserDetails = User("user@example.com", "hashed", emptyList())
            .withTokenVersion(0, "user-1", false)
        whenever(authenticationManager.authenticate(any())).thenReturn(
            UsernamePasswordAuthenticationToken(principal, null, principal.authorities)
        )

        val ex = assertThrows<ApplicationException> {
            authService().signIn(SignInRequest("user@example.com", "password"))
        }
        assertEquals("EMAIL_NOT_VERIFIED", ex.code)
    }

    @Test
    fun `refresh access token looks up normalized email from token subject`() {
        val user = UserAccountDocument(
            firstName = "User",
            lastName = "Test",
            email = "user@example.com",
            password = "hashed",
            country = "USA",
            age = 30
        )
        whenever(jwtTokenProvider.validateRefreshToken("refresh-token")).thenReturn(true)
        whenever(jwtTokenProvider.getUsernameFromJWT("refresh-token")).thenReturn("  User@Example.COM  ")
        whenever(jwtTokenProvider.getTokenVersionFromJWT("refresh-token")).thenReturn(0)
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("new-access-token")

        val response = authService().refreshAccessToken(RefreshTokenRequest("refresh-token"))

        verify(userAccountRepository).findByEmailIgnoreCase("user@example.com")
        assertEquals("new-access-token", response.accessToken)
    }

    @Test
    fun `refresh access token rejects token version mismatch`() {
        val user = UserAccountDocument(
            firstName = "User",
            lastName = "Test",
            email = "user@example.com",
            password = "hashed",
            country = "USA",
            age = 30,
            tokenVersion = 2
        )
        whenever(jwtTokenProvider.validateRefreshToken("refresh-token")).thenReturn(true)
        whenever(jwtTokenProvider.getUsernameFromJWT("refresh-token")).thenReturn("user@example.com")
        whenever(jwtTokenProvider.getTokenVersionFromJWT("refresh-token")).thenReturn(1)
        whenever(userAccountRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)

        val ex = assertThrows<ApplicationException> {
            authService().refreshAccessToken(RefreshTokenRequest("refresh-token"))
        }
        assertEquals("INVALID_TOKEN", ex.code)
    }
}
