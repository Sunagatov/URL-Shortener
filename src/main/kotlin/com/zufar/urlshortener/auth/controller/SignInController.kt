package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.common.exception.ErrorResponse
import com.zufar.urlshortener.auth.service.JwtTokenProvider
import com.zufar.urlshortener.auth.service.validator.AuthRequestValidator
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class SignInController(
    private val authenticationManager: AuthenticationManager,
    private val jwtTokenProvider: JwtTokenProvider,
    private val authRequestValidator: AuthRequestValidator
) {

    @Operation(
        summary = "User Sign-in",
        description = "Authenticate user with email and password to obtain JWT tokens."
    )
    @ApiResponses(value = [
        ApiResponse(
            responseCode = "200",
            description = "Successfully authenticated user.",
            content = [Content(
                schema = Schema(implementation = AuthResponse::class)
            )]
        ),
        ApiResponse(
            responseCode = "400",
            description = "Invalid request data.",
            content = [Content(
                schema = Schema(implementation = ErrorResponse::class)
            )]
        ),
        ApiResponse(
            responseCode = "401",
            description = "Invalid credentials.",
            content = [Content(
                schema = Schema(implementation = ErrorResponse::class)
            )]
        )
    ])
    @PostMapping("/signin")
    fun authenticateUser(
        @RequestBody signInRequest: SignInRequest
    ): ResponseEntity<AuthResponse> {
        authRequestValidator.validateAuthRequest(signInRequest)

        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                signInRequest.email,
                signInRequest.password
            )
        )

        val userDetails = authentication.principal as org.springframework.security.core.userdetails.User

        val accessToken = jwtTokenProvider.generateAccessToken(userDetails)
        val refreshToken = jwtTokenProvider.generateRefreshToken(userDetails)

        return ResponseEntity.ok(AuthResponse(accessToken, refreshToken))
    }
}