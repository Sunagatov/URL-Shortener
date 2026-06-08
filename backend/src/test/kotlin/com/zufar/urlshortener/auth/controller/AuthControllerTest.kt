package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenResponse
import com.zufar.urlshortener.auth.dto.ResendVerificationRequest
import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.auth.dto.SignUpResponse
import com.zufar.urlshortener.auth.dto.VerificationChallengeResponse
import com.zufar.urlshortener.auth.dto.VerifyEmailRequest
import com.zufar.urlshortener.auth.service.AuthService
import com.zufar.urlshortener.auth.service.GoogleAuthService
import com.zufar.urlshortener.auth.service.PasswordResetService
import com.zufar.urlshortener.shared.turnstile.TurnstileProperties
import com.zufar.urlshortener.shared.turnstile.TurnstileVerifier
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class AuthControllerTest {

    @Mock private lateinit var authService: AuthService
    @Mock private lateinit var googleAuthService: GoogleAuthService
    @Mock private lateinit var passwordResetService: PasswordResetService
    @Mock private lateinit var turnstileVerifier: TurnstileVerifier

    private fun controller(authTurnstileEnabled: Boolean = false) = AuthController(
        authService = authService,
        googleAuthService = googleAuthService,
        passwordResetService = passwordResetService,
        turnstileVerifier = turnstileVerifier,
        turnstileProperties = TurnstileProperties(
            enabled = authTurnstileEnabled,
            authEnabled = authTurnstileEnabled,
            secretKey = if (authTurnstileEnabled) "test-secret" else ""
        )
    )

    @Test
    fun `authenticateUser delegates to auth service`() {
        val controller = controller()
        val request = SignInRequest("user@example.com", "password")
        val response = AuthResponse("access-token", "refresh-token")
        whenever(authService.signIn(request)).thenReturn(response)

        val result = controller.authenticateUser(request)

        verify(authService).signIn(request)
        verifyNoInteractions(turnstileVerifier)
        assertEquals(response, result.body)
    }

    @Test
    fun `authenticateUser verifies Turnstile token when auth protection is enabled`() {
        val controller = controller(authTurnstileEnabled = true)
        val request = SignInRequest("user@example.com", "password", "turnstile-token")
        val response = AuthResponse("access-token", "refresh-token")
        whenever(authService.signIn(request)).thenReturn(response)

        val result = controller.authenticateUser(request)

        verify(turnstileVerifier).verify("turnstile-token")
        verify(authService).signIn(request)
        assertEquals(response, result.body)
    }

    @Test
    fun `registerUser delegates to auth service`() {
        val controller = controller()
        val request = SignUpRequest(
            firstName = "Jane",
            lastName = "Doe",
            country = "USA",
            age = 28,
            email = "jane@example.com",
            password = "SecurePassword123!"
        )
        val response = SignUpResponse(
            verificationRequired = true,
            email = "jane@example.com",
            expiresInSeconds = 600,
            resendAvailableInSeconds = 60,
            deliveryMode = "log"
        )
        whenever(authService.signUp(request)).thenReturn(response)

        val result = controller.registerUser(request)

        verify(authService).signUp(request)
        assertEquals(response, result.body)
    }

    @Test
    fun `refreshAccessToken delegates to auth service`() {
        val controller = controller()
        val request = RefreshTokenRequest("refresh-token")
        val response = RefreshTokenResponse("new-access-token")
        whenever(authService.refreshAccessToken(request)).thenReturn(response)

        val result = controller.refreshAccessToken(request)

        verify(authService).refreshAccessToken(request)
        assertEquals(response, result.body)
    }

    @Test
    fun `verifyEmail delegates to auth service`() {
        val controller = controller()
        val request = VerifyEmailRequest("user@example.com", "123456")
        val response = AuthResponse("access-token", "refresh-token")
        whenever(authService.verifyEmail(request)).thenReturn(response)

        val result = controller.verifyEmail(request)

        verify(authService).verifyEmail(request)
        assertEquals(response, result.body)
    }

    @Test
    fun `resendVerificationCode delegates to auth service`() {
        val controller = controller()
        val request = ResendVerificationRequest("user@example.com")
        val response = VerificationChallengeResponse(
            email = "user@example.com",
            expiresInSeconds = 600,
            resendAvailableInSeconds = 60,
            deliveryMode = "email"
        )
        whenever(authService.resendVerificationCode(request)).thenReturn(response)

        val result = controller.resendVerificationCode(request)

        verify(authService).resendVerificationCode(request)
        assertEquals(response, result.body)
    }
}
