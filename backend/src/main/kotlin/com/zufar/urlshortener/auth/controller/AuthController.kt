package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.ForgotPasswordRequest
import com.zufar.urlshortener.auth.dto.GoogleAuthRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenResponse
import com.zufar.urlshortener.auth.dto.ResendVerificationRequest
import com.zufar.urlshortener.auth.dto.ResetPasswordRequest
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
import com.zufar.urlshortener.shared.web.ApplicationRoutes
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

private const val TURNSTILE_ACTION_FORGOT_PASSWORD = "forgot_password"
private const val TURNSTILE_ACTION_FORGOT_PASSWORD_RESEND = "forgot_password_resend"
private const val TURNSTILE_ACTION_GOOGLE_SIGNIN = "google_signin"
private const val TURNSTILE_ACTION_RESET_PASSWORD = "reset_password"
private const val TURNSTILE_ACTION_SIGNIN = "signin"
private const val TURNSTILE_ACTION_SIGNUP = "signup"
private const val TURNSTILE_ACTION_VERIFY_EMAIL = "verify_email"

@RestController
@RequestMapping(ApplicationRoutes.AUTH_BASE_PATH)
class AuthController(
    private val authService: AuthService,
    private val googleAuthService: GoogleAuthService,
    private val passwordResetService: PasswordResetService,
    private val turnstileVerifier: TurnstileVerifier,
    private val turnstileProperties: TurnstileProperties
) {

    @PostMapping("/google")
    fun authenticateWithGoogle(
        @Valid @RequestBody googleAuthRequest: GoogleAuthRequest
    ): ResponseEntity<AuthResponse> {
        verifyAuthTurnstile(googleAuthRequest.turnstileToken, TURNSTILE_ACTION_GOOGLE_SIGNIN)
        return ResponseEntity.ok(googleAuthService.authenticate(googleAuthRequest.code))
    }

    @PostMapping("/signin")
    fun authenticateUser(
        @Valid @RequestBody signInRequest: SignInRequest
    ): ResponseEntity<AuthResponse> {
        verifyAuthTurnstile(signInRequest.turnstileToken, TURNSTILE_ACTION_SIGNIN)
        return ResponseEntity.ok(authService.signIn(signInRequest))
    }

    @PostMapping("/signup")
    fun registerUser(
        @Valid @RequestBody signUpRequest: SignUpRequest
    ): ResponseEntity<SignUpResponse> {
        verifyAuthTurnstile(signUpRequest.turnstileToken, TURNSTILE_ACTION_SIGNUP)
        return ResponseEntity.ok(authService.signUp(signUpRequest))
    }

    @PostMapping("/refresh-token")
    fun refreshAccessToken(
        @Valid @RequestBody refreshTokenRequest: RefreshTokenRequest
    ): ResponseEntity<RefreshTokenResponse> =
        ResponseEntity.ok(authService.refreshAccessToken(refreshTokenRequest))

    @PostMapping("/verify-email")
    fun verifyEmail(
        @Valid @RequestBody verifyEmailRequest: VerifyEmailRequest
    ): ResponseEntity<AuthResponse> {
        verifyAuthTurnstile(verifyEmailRequest.turnstileToken, TURNSTILE_ACTION_VERIFY_EMAIL)
        return ResponseEntity.ok(authService.verifyEmail(verifyEmailRequest))
    }

    @PostMapping("/resend-verification")
    fun resendVerificationCode(
        @Valid @RequestBody resendVerificationRequest: ResendVerificationRequest
    ): ResponseEntity<VerificationChallengeResponse> {
        verifyAuthTurnstile(resendVerificationRequest.turnstileToken, TURNSTILE_ACTION_VERIFY_EMAIL)
        return ResponseEntity.ok(authService.resendVerificationCode(resendVerificationRequest))
    }

    @PostMapping("/forgot-password")
    fun forgotPassword(
        @Valid @RequestBody request: ForgotPasswordRequest
    ): ResponseEntity<Void> {
        verifyAuthTurnstile(
            request.turnstileToken,
            TURNSTILE_ACTION_FORGOT_PASSWORD,
            TURNSTILE_ACTION_FORGOT_PASSWORD_RESEND
        )
        passwordResetService.requestReset(request)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/reset-password")
    fun resetPassword(
        @Valid @RequestBody request: ResetPasswordRequest
    ): ResponseEntity<Void> {
        verifyAuthTurnstile(request.turnstileToken, TURNSTILE_ACTION_RESET_PASSWORD)
        passwordResetService.resetPassword(request)
        return ResponseEntity.noContent().build()
    }

    private fun verifyAuthTurnstile(token: String?, vararg expectedActions: String) {
        if (turnstileProperties.authEnabled) {
            turnstileVerifier.verify(token, expectedActions.toSet())
        }
    }
}
