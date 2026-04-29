package com.zufar.urlshortener.auth.service.token

import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenResponse
import com.zufar.urlshortener.auth.entity.UserDetails
import com.zufar.urlshortener.auth.exception.InvalidTokenException
import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.auth.service.EmailNormalizer
import com.zufar.urlshortener.auth.service.support.AuthTokenIssuer
import com.zufar.urlshortener.auth.validation.AuthRequestValidator
import org.springframework.stereotype.Service

@Service
class RefreshAccessTokenService(
    private val authRequestValidator: AuthRequestValidator,
    private val userRepository: UserRepository,
    private val jwtTokenProvider: JwtTokenProvider,
    private val authTokenIssuer: AuthTokenIssuer
) {

    fun refresh(refreshTokenRequest: RefreshTokenRequest): RefreshTokenResponse {
        authRequestValidator.validateRefreshTokenRequest(refreshTokenRequest)

        val refreshToken = refreshTokenRequest.refreshToken
        validateRefreshToken(refreshToken)

        val userDetails = findUserByRefreshToken(refreshToken)
        validateRefreshTokenVersion(refreshToken, userDetails)

        return RefreshTokenResponse(authTokenIssuer.issueAccessToken(userDetails))
    }

    private fun validateRefreshToken(refreshToken: String) {
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw InvalidTokenException("Invalid or expired refresh token")
        }
    }

    private fun findUserByRefreshToken(refreshToken: String): UserDetails {
        val normalizedEmail = EmailNormalizer.normalize(jwtTokenProvider.getUsernameFromJWT(refreshToken))
        return userRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw UserNotFoundException("User not found for the provided refresh token")
    }

    private fun validateRefreshTokenVersion(refreshToken: String, userDetails: UserDetails) {
        val tokenVersion = jwtTokenProvider.getTokenVersionFromJWT(refreshToken)
            ?: throw InvalidTokenException("Invalid or expired refresh token")
        if (tokenVersion != userDetails.tokenVersion) {
            throw InvalidTokenException("Invalid or expired refresh token")
        }
    }
}
