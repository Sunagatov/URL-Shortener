package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenResponse
import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.auth.entity.UserDetails
import com.zufar.urlshortener.auth.exception.EmailAlreadyExistsException
import com.zufar.urlshortener.auth.exception.InvalidTokenException
import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.auth.service.support.AuthTokenIssuer
import com.zufar.urlshortener.auth.validation.AuthRequestValidator
import org.springframework.dao.DuplicateKeyException
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.User
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

@Service
class AuthService(
    private val authenticationManager: AuthenticationManager,
    private val authRequestValidator: AuthRequestValidator,
    private val authTokenIssuer: AuthTokenIssuer,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val clock: Clock
) {

    fun signIn(request: SignInRequest): AuthResponse {
        val normalizedRequest = request.copy(email = EmailNormalizer.normalize(request.email))
        authRequestValidator.validateAuthRequest(normalizedRequest)

        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(normalizedRequest.email, request.password)
        )

        return authTokenIssuer.issueAuthentication(authentication.principal as User)
    }

    fun signUp(request: SignUpRequest): AuthResponse {
        val normalizedRequest = request.copy(email = EmailNormalizer.normalize(request.email))
        authRequestValidator.validateSignUpRequest(normalizedRequest)
        ensureEmailIsAvailable(normalizedRequest.email)

        val now = LocalDateTime.now(clock)
        val encodedPassword = requireNotNull(passwordEncoder.encode(normalizedRequest.password)) {
            "Password encoder returned null during sign-up"
        }

        val user = UserDetails(
            firstName = normalizedRequest.firstName,
            lastName = normalizedRequest.lastName,
            email = normalizedRequest.email,
            password = encodedPassword,
            country = normalizedRequest.country,
            age = normalizedRequest.age,
            createdAt = now,
            updatedAt = now
        )

        return authTokenIssuer.issueAuthentication(saveUser(user))
    }

    fun refreshAccessToken(request: RefreshTokenRequest): RefreshTokenResponse {
        authRequestValidator.validateRefreshTokenRequest(request)

        val refreshToken = request.refreshToken
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw InvalidTokenException("Invalid or expired refresh token")
        }

        val user = findUserForRefreshToken(refreshToken)
        val tokenVersion = jwtTokenProvider.getTokenVersionFromJWT(refreshToken)
            ?: throw InvalidTokenException("Invalid or expired refresh token")

        if (tokenVersion != user.tokenVersion) {
            throw InvalidTokenException("Invalid or expired refresh token")
        }

        return RefreshTokenResponse(authTokenIssuer.issueAccessToken(user))
    }

    private fun ensureEmailIsAvailable(email: String) {
        if (userRepository.findByEmailIgnoreCase(email) != null) {
            throw EmailAlreadyExistsException("Email is already in use")
        }
    }

    private fun saveUser(user: UserDetails): UserDetails =
        try {
            userRepository.save(user)
        } catch (_: DuplicateKeyException) {
            throw EmailAlreadyExistsException("Email is already in use")
        }

    private fun findUserForRefreshToken(refreshToken: String): UserDetails {
        val normalizedEmail = EmailNormalizer.normalize(jwtTokenProvider.getUsernameFromJWT(refreshToken))
        return userRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw UserNotFoundException("User not found for the provided refresh token")
    }
}
