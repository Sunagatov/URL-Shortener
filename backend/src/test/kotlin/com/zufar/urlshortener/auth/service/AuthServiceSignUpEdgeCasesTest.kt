package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.SignUpRequest
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
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.dao.DuplicateKeyException
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class AuthServiceSignUpEdgeCasesTest {

    @Mock private lateinit var authenticationManager: AuthenticationManager
    @Mock private lateinit var jwtTokenProvider: JwtTokenProvider
    @Mock private lateinit var userAccountRepository: UserAccountRepository
    @Mock private lateinit var passwordEncoder: PasswordEncoder
    @Mock private lateinit var emailVerificationNotifier: EmailVerificationNotifier
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    private fun authService(emailVerificationEnabled: Boolean = false) = AuthService(
        authenticationManager = authenticationManager,
        userAccountRepository = userAccountRepository,
        passwordEncoder = passwordEncoder,
        jwtTokenProvider = jwtTokenProvider,
        emailVerificationNotifier = emailVerificationNotifier,
        emailVerificationEnabled = emailVerificationEnabled,
        verificationExpirationMinutes = 10,
        verificationResendCooldownSeconds = 60,
        clock = clock
    )

    private fun validRequest(email: String = "new@example.com") = SignUpRequest(
        firstName = "Jane", lastName = "Doe", country = "USA", age = 28,
        email = email, password = "SecurePassword123!"
    )

    @Test
    fun `signUp rejects duplicate email from existing Google user`() {
        val googleUser = UserAccountDocument(
            id = "g-1", firstName = "G", lastName = "User", email = "g@example.com",
            authProvider = AuthProvider.GOOGLE, emailVerified = true
        )
        whenever(userAccountRepository.findByEmailIgnoreCase("g@example.com")).thenReturn(googleUser)

        val ex = assertThrows<ApplicationException> { authService().signUp(validRequest("g@example.com")) }
        assertEquals("EMAIL_ALREADY_EXISTS", ex.code)
    }

    @Test
    fun `signUp handles DuplicateKeyException race condition`() {
        whenever(userAccountRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(null)
        whenever(passwordEncoder.encode(any<String>())).thenReturn("hashed")
        whenever(userAccountRepository.save(any<UserAccountDocument>())).thenThrow(DuplicateKeyException("dup"))

        val ex = assertThrows<ApplicationException> { authService().signUp(validRequest()) }
        assertEquals("EMAIL_ALREADY_EXISTS", ex.code)
    }

    @Test
    fun `signUp with age at minimum boundary 13`() {
        whenever(passwordEncoder.encode(any<String>())).thenReturn("hashed")
        whenever(userAccountRepository.save(any<UserAccountDocument>())).thenAnswer { it.arguments[0] }
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("at")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("rt")

        val response = authService().signUp(validRequest().copy(age = 13))
        assertEquals("at", response.accessToken)
    }

    @Test
    fun `signUp with age at maximum boundary 120`() {
        whenever(passwordEncoder.encode(any<String>())).thenReturn("hashed")
        whenever(userAccountRepository.save(any<UserAccountDocument>())).thenAnswer { it.arguments[0] }
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("at")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("rt")

        val response = authService().signUp(validRequest().copy(age = 120))
        assertEquals("at", response.accessToken)
    }
}
