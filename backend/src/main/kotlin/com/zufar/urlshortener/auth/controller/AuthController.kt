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
    private val authService: AuthService
) {

    @PostMapping("/signin")
    fun authenticateUser(
        @Valid @RequestBody signInRequest: SignInRequest
    ): ResponseEntity<AuthResponse> =
        ResponseEntity.ok(authService.signIn(signInRequest))

    @PostMapping("/signup")
    fun registerUser(
        @Valid @RequestBody signUpRequest: SignUpRequest
    ): ResponseEntity<SignUpResponse> =
        ResponseEntity.ok(authService.signUp(signUpRequest))

    @PostMapping("/refresh-token")
    fun refreshAccessToken(
        @Valid @RequestBody refreshTokenRequest: RefreshTokenRequest
    ): ResponseEntity<RefreshTokenResponse> =
        ResponseEntity.ok(authService.refreshAccessToken(refreshTokenRequest))

    @PostMapping("/verify-email")
    fun verifyEmail(
        @Valid @RequestBody verifyEmailRequest: VerifyEmailRequest
    ): ResponseEntity<AuthResponse> =
        ResponseEntity.ok(authService.verifyEmail(verifyEmailRequest))

    @PostMapping("/resend-verification")
    fun resendVerificationCode(
        @Valid @RequestBody resendVerificationRequest: ResendVerificationRequest
    ): ResponseEntity<VerificationChallengeResponse> =
        ResponseEntity.ok(authService.resendVerificationCode(resendVerificationRequest))
}
