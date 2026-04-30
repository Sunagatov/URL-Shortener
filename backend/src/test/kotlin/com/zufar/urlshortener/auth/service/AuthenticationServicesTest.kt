package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.ResendVerificationRequest
import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.auth.dto.VerifyEmailRequest
import com.zufar.urlshortener.auth.entity.UserDetails as UserEntity
import com.zufar.urlshortener.auth.exception.EmailAlreadyExistsException
import com.zufar.urlshortener.auth.exception.EmailNotVerifiedException
import com.zufar.urlshortener.auth.exception.InvalidTokenException
import com.zufar.urlshortener.auth.exception.InvalidVerificationCodeException
import com.zufar.urlshortener.auth.exception.VerificationResendTooSoonException
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.auth.security.withTokenVersion
import com.zufar.urlshortener.auth.validation.AuthRequestValidator
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails as SecurityUserDetails
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Clock
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

@ExtendWith(MockitoExtension::class)
class AuthenticationServicesTest {

    @Mock private lateinit var authenticationManager: AuthenticationManager
    @Mock private lateinit var jwtTokenProvider: JwtTokenProvider
    @Mock private lateinit var authRequestValidator: AuthRequestValidator
    @Mock private lateinit var userRepository: UserRepository
    @Mock private lateinit var passwordEncoder: PasswordEncoder
    @Mock private lateinit var emailVerificationNotifier: EmailVerificationNotifier
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    private fun authService() = AuthService(
        authenticationManager = authenticationManager,
        authRequestValidator = authRequestValidator,
        userRepository = userRepository,
        passwordEncoder = passwordEncoder,
        jwtTokenProvider = jwtTokenProvider,
        emailVerificationNotifier = emailVerificationNotifier,
        verificationExpirationMinutes = 10,
        verificationResendCooldownSeconds = 60,
        clock = clock
    )

    @Test
    fun `register lowercases and trims email before save`() {
        whenever(passwordEncoder.encode(any<String>())).thenAnswer { invocation ->
            when (invocation.arguments[0] as String) {
                "SecurePassword123!" -> "hashed-password"
                else -> "verification-code-hash"
            }
        }
        whenever(userRepository.save(any<UserEntity>())).thenAnswer { it.arguments[0] }
        whenever(emailVerificationNotifier.sendCode(any(), any(), any())).thenReturn("log")

        val response = authService().signUp(
            SignUpRequest(
                firstName = "Jane",
                lastName = "Doe",
                country = "USA",
                age = 28,
                email = "  Jane.Doe@Example.COM  ",
                password = "SecurePassword123!"
            )
        )

        verify(userRepository).findByEmailIgnoreCase("jane.doe@example.com")
        val captor = ArgumentCaptor.forClass(UserEntity::class.java)
        verify(userRepository).save(captor.capture())
        assertEquals("jane.doe@example.com", captor.value.email)
        assertFalse(captor.value.emailVerified)
        assertEquals("verification-code-hash", captor.value.emailVerificationCodeHash)
        assertEquals("2024-01-01T10:15:30", captor.value.createdAt.toString())
        assertEquals(captor.value.createdAt, captor.value.updatedAt)
        assertEquals("jane.doe@example.com", response.email)
        assertEquals(600, response.expiresInSeconds)
        assertEquals(60, response.resendAvailableInSeconds)
        assertEquals("log", response.deliveryMode)
    }

    @Test
    fun `register duplicate check is case-insensitive`() {
        whenever(userRepository.findByEmailIgnoreCase("jane.doe@example.com")).thenReturn(
            UserEntity(
                firstName = "Jane",
                lastName = "Doe",
                email = "jane.doe@example.com",
                password = "hashed",
                country = "USA",
                age = 28
            )
        )

        assertThrows<EmailAlreadyExistsException> {
            authService().signUp(
                SignUpRequest(
                    firstName = "Jane",
                    lastName = "Doe",
                    country = "USA",
                    age = 28,
                    email = "Jane.Doe@Example.COM",
                    password = "SecurePassword123!"
                )
            )
        }
    }

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

        val captor = ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken::class.java)
        verify(authenticationManager).authenticate(captor.capture())
        assertEquals("user@example.com", captor.value.principal)
    }

    @Test
    fun `sign in rejects unverified users`() {
        val principal: SecurityUserDetails = User("user@example.com", "hashed", emptyList())
            .withTokenVersion(0, "user-1", false)
        whenever(authenticationManager.authenticate(any())).thenReturn(
            UsernamePasswordAuthenticationToken(principal, null, principal.authorities)
        )

        assertThrows<EmailNotVerifiedException> {
            authService().signIn(SignInRequest("user@example.com", "password"))
        }
    }

    @Test
    fun `refresh access token looks up normalized email from token subject`() {
        val user = UserEntity(
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
        whenever(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("new-access-token")

        val response = authService().refreshAccessToken(RefreshTokenRequest("refresh-token"))

        verify(userRepository).findByEmailIgnoreCase("user@example.com")
        assertEquals("new-access-token", response.accessToken)
    }

    @Test
    fun `refresh access token rejects token version mismatch`() {
        val user = UserEntity(
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
        whenever(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)

        assertThrows<InvalidTokenException> {
            authService().refreshAccessToken(RefreshTokenRequest("refresh-token"))
        }
    }

    @Test
    fun `verify email marks account verified and issues tokens`() {
        val user = UserEntity(
            id = "user-1",
            firstName = "User",
            lastName = "Test",
            email = "user@example.com",
            password = "hashed-password",
            country = "USA",
            age = 30,
            emailVerificationCodeHash = "verification-hash",
            emailVerificationCodeExpiresAt = LocalDateTime.of(2024, 1, 1, 10, 25, 30),
            emailVerificationCodeSentAt = LocalDateTime.of(2024, 1, 1, 10, 15, 30)
        )
        whenever(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)
        whenever(passwordEncoder.matches("123456", "verification-hash")).thenReturn(true)
        whenever(userRepository.save(any<UserEntity>())).thenAnswer { it.arguments[0] }
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("access-token")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh-token")

        val response = authService().verifyEmail(VerifyEmailRequest("user@example.com", "123456"))

        assertEquals("access-token", response.accessToken)
        assertEquals("refresh-token", response.refreshToken)
        val captor = ArgumentCaptor.forClass(UserEntity::class.java)
        verify(userRepository).save(captor.capture())
        assertTrue(captor.value.emailVerified)
        assertNull(captor.value.emailVerificationCodeHash)
        assertNull(captor.value.emailVerificationCodeExpiresAt)
        assertNull(captor.value.emailVerificationCodeSentAt)
    }

    @Test
    fun `verify email rejects invalid code`() {
        val user = UserEntity(
            firstName = "User",
            lastName = "Test",
            email = "user@example.com",
            password = "hashed-password",
            country = "USA",
            age = 30,
            emailVerificationCodeHash = "verification-hash",
            emailVerificationCodeExpiresAt = LocalDateTime.of(2024, 1, 1, 10, 25, 30)
        )
        whenever(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)
        whenever(passwordEncoder.matches("123456", "verification-hash")).thenReturn(false)

        assertThrows<InvalidVerificationCodeException> {
            authService().verifyEmail(VerifyEmailRequest("user@example.com", "123456"))
        }
    }

    @Test
    fun `resend verification rejects cooldown violations`() {
        val user = UserEntity(
            firstName = "User",
            lastName = "Test",
            email = "user@example.com",
            password = "hashed-password",
            country = "USA",
            age = 30,
            emailVerificationCodeSentAt = LocalDateTime.of(2024, 1, 1, 10, 15, 5)
        )
        whenever(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(user)

        val ex = assertThrows<VerificationResendTooSoonException> {
            authService().resendVerificationCode(ResendVerificationRequest("user@example.com"))
        }

        assertEquals(35, ex.retryAfterSeconds)
        verify(emailVerificationNotifier, never()).sendCode(any(), any(), any())
    }
}
