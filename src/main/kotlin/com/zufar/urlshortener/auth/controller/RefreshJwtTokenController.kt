package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.common.dto.ErrorResponse
import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenResponse
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.JwtTokenProvider
import com.zufar.urlshortener.auth.exception.InvalidTokenException
import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.auth.service.validator.AuthRequestValidator
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class RefreshJwtTokenController(
    private val userRepository: UserRepository,
    private val jwtTokenProvider: JwtTokenProvider,
    private val authRequestValidator: AuthRequestValidator
) {

    @Operation(
        summary = "Refresh Access Token",
        description = "Obtain a new access token using a refresh token."
    )
    @ApiResponses(value = [
        ApiResponse(
            responseCode = "200",
            description = "Successfully refreshed access token.",
            content = [Content(
                schema = Schema(implementation = RefreshTokenResponse::class)
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
            description = "Invalid or expired refresh token.",
            content = [Content(
                schema = Schema(implementation = ErrorResponse::class)
            )]
        ),
        ApiResponse(
            responseCode = "404",
            description = "User not found.",
            content = [Content(
                schema = Schema(implementation = ErrorResponse::class)
            )]
        )
    ])
    @PostMapping("/refresh-token")
    fun refreshAccessToken(
        @RequestBody refreshTokenRequest: RefreshTokenRequest
    ): ResponseEntity<RefreshTokenResponse> {
        authRequestValidator.validateRefreshTokenRequest(refreshTokenRequest)

        if (!jwtTokenProvider.validateToken(refreshTokenRequest.refreshToken)) {
            throw InvalidTokenException("Invalid or expired refresh token")
        }

        val username = jwtTokenProvider.getUsernameFromJWT(refreshTokenRequest.refreshToken)
        val userDetails = userRepository.findByEmail(username)
            ?: throw UserNotFoundException("User not found for refresh token")

        val userSpringDetails = org.springframework.security.core.userdetails.User(
            userDetails.email,
            userDetails.password,
            emptyList()
        )
        val newAccessToken = jwtTokenProvider.generateAccessToken(userSpringDetails)

        return ResponseEntity.ok(RefreshTokenResponse(newAccessToken))
    }
}