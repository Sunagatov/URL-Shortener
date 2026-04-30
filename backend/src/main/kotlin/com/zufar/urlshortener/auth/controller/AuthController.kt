package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenResponse
import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.auth.service.AuthService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/signin")
    fun authenticateUser(
        @RequestBody signInRequest: SignInRequest
    ): ResponseEntity<AuthResponse> =
        ResponseEntity.ok(authService.signIn(signInRequest))

    @PostMapping("/signup")
    fun registerUser(
        @RequestBody signUpRequest: SignUpRequest
    ): ResponseEntity<AuthResponse> =
        ResponseEntity.ok(authService.signUp(signUpRequest))

    @PostMapping("/refresh-token")
    fun refreshAccessToken(
        @RequestBody refreshTokenRequest: RefreshTokenRequest
    ): ResponseEntity<RefreshTokenResponse> =
        ResponseEntity.ok(authService.refreshAccessToken(refreshTokenRequest))
}
