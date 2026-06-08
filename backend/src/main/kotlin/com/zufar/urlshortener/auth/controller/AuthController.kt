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
        verifyAuthTurnstile(googleAuthRequest.turnstileToken)
        return ResponseEntity.ok(googleAuthService.authenticate(googleAuthRequest.code))
    }

    @PostMapping("/signin")
    fun authenticateUser(
        @Valid @RequestBody signInRequest: SignInRequest
    ): ResponseEntity<AuthResponse> {
        verifyAuthTurnstile(signInRequest.turnstileToken)
        return ResponseEntity.ok(authService.signIn(signInRequest))
    }

    @PostMapping("/signup")
    fun registerUser(
        @Valid @RequestBody signUpRequest: SignUpRequest
    ): ResponseEntity<SignUpResponse> {
        verifyAuthTurnstile(signUpRequest.turnstileToken)
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
        verifyAuthTurnstile(verifyEmailRequest.turnstileToken)
        return ResponseEntity.ok(authService.verifyEmail(verifyEmailRequest))
    }

    @PostMapping("/resend-verification")
    fun resendVerificationCode(
        @Valid @RequestBody resendVerificationRequest: ResendVerificationRequest
    ): ResponseEntity<VerificationChallengeResponse> {
        verifyAuthTurnstile(resendVerificationRequest.turnstileToken)
        return ResponseEntity.ok(authService.resendVerificationCode(resendVerificationRequest))
    }

    @PostMapping("/forgot-password")
    fun forgotPassword(
        @Valid @RequestBody request: ForgotPasswordRequest
    ): ResponseEntity<Void> {
        verifyAuthTurnstile(request.turnstileToken)
        passwordResetService.requestReset(request)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/reset-password")
    fun resetPassword(
        @Valid @RequestBody request: ResetPasswordRequest
    ): ResponseEntity<Void> {
        verifyAuthTurnstile(request.turnstileToken)
        passwordResetService.resetPassword(request)
        return ResponseEntity.noContent().build()
    }

    private fun verifyAuthTurnstile(token: String?) {
        if (turnstileProperties.authEnabled) {
            turnstileVerifier.verify(token)
        }
    }
}
