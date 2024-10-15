package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.common.exception.ErrorResponse
import com.zufar.urlshortener.auth.entity.UserDetails
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.JwtTokenProvider
import com.zufar.urlshortener.auth.exception.EmailAlreadyExistsException
import com.zufar.urlshortener.auth.service.validator.AuthRequestValidator
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/v1/auth")
class SignUpController(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val authRequestValidator: AuthRequestValidator
) {

    @Operation(
        summary = "User Sign-up",
        description = "Register a new user and obtain JWT tokens."
    )
    @ApiResponses(value = [
        ApiResponse(
            responseCode = "200",
            description = "User registered successfully.",
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
            responseCode = "409",
            description = "Email already in use.",
            content = [Content(
                schema = Schema(implementation = ErrorResponse::class)
            )]
        )
    ])
    @PostMapping("/signup")
    fun registerUser(
        @RequestBody signUpRequest: SignUpRequest
    ): ResponseEntity<AuthResponse> {
        authRequestValidator.validateSignUpRequest(signUpRequest)

        if (userRepository.findByEmail(signUpRequest.email) != null) {
            throw EmailAlreadyExistsException("Email is already in use")
        }

        val user = UserDetails(
            firstName = signUpRequest.firstName,
            lastName = signUpRequest.lastName,
            email = signUpRequest.email,
            password = passwordEncoder.encode(signUpRequest.password),
            country = signUpRequest.country,
            age = signUpRequest.age,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )

        userRepository.save(user)

        val userDetails = org.springframework.security.core.userdetails.User(user.email, user.password, emptyList())
        val accessToken = jwtTokenProvider.generateAccessToken(userDetails)
        val refreshToken = jwtTokenProvider.generateRefreshToken(userDetails)

        return ResponseEntity.ok(AuthResponse(accessToken, refreshToken))
    }
}