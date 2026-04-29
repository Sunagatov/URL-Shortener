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
import com.zufar.urlshortener.auth.service.validator.AuthRequestValidator
import org.springframework.dao.DuplicateKeyException
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails as SpringUserDetails
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class AuthService(
    private val authenticationManager: AuthenticationManager,
    private val jwtTokenProvider: JwtTokenProvider,
    private val authRequestValidator: AuthRequestValidator,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {

    fun authenticateUser(signInRequest: SignInRequest): AuthResponse {
        val normalizedRequest = signInRequest.normalizeEmail()
        authRequestValidator.validateAuthRequest(normalizedRequest)

        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(
                normalizedRequest.email,
                signInRequest.password
            )
        )

        return createAuthResponse(authentication.principal as User)
    }

    fun registerUser(signUpRequest: SignUpRequest): AuthResponse {
        val normalizedRequest = signUpRequest.normalizeEmail()
        authRequestValidator.validateSignUpRequest(normalizedRequest)
        ensureEmailIsAvailable(normalizedRequest.email)

        val user = saveUser(buildUser(normalizedRequest))
        return createAuthResponse(user.toSpringUser().withTokenVersion(user.tokenVersion))
    }

    fun refreshAccessToken(refreshTokenRequest: RefreshTokenRequest): RefreshTokenResponse {
        authRequestValidator.validateRefreshTokenRequest(refreshTokenRequest)

        val refreshToken = refreshTokenRequest.refreshToken
        validateRefreshToken(refreshToken)

        val normalizedEmail = EmailNormalizer.normalize(jwtTokenProvider.getUsernameFromJWT(refreshToken))
        val userDetails = userRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw UserNotFoundException("User not found for the provided refresh token")
        val tokenVersion = jwtTokenProvider.getTokenVersionFromJWT(refreshToken)
            ?: throw InvalidTokenException("Invalid or expired refresh token")
        if (tokenVersion != userDetails.tokenVersion) {
            throw InvalidTokenException("Invalid or expired refresh token")
        }

        val newAccessToken =
            jwtTokenProvider.generateAccessToken(userDetails.toSpringUser().withTokenVersion(userDetails.tokenVersion))

        return RefreshTokenResponse(newAccessToken)
    }

    private fun SignInRequest.normalizeEmail(): SignInRequest =
        copy(email = EmailNormalizer.normalize(email))

    private fun SignUpRequest.normalizeEmail(): SignUpRequest =
        copy(email = EmailNormalizer.normalize(email))

    private fun ensureEmailIsAvailable(email: String) {
        if (userRepository.findByEmailIgnoreCase(email) != null) {
            throw EmailAlreadyExistsException("Email is already in use")
        }
    }

    private fun buildUser(signUpRequest: SignUpRequest): UserDetails {
        val now = LocalDateTime.now()

        return UserDetails(
            firstName = signUpRequest.firstName,
            lastName = signUpRequest.lastName,
            email = signUpRequest.email,
            password = passwordEncoder.encode(signUpRequest.password),
            country = signUpRequest.country,
            age = signUpRequest.age,
            createdAt = now,
            updatedAt = now
        )
    }

    private fun saveUser(user: UserDetails): UserDetails {
        return try {
            userRepository.save(user)
        } catch (_: DuplicateKeyException) {
            throw EmailAlreadyExistsException("Email is already in use")
        }
    }

    private fun createAuthResponse(userDetails: SpringUserDetails): AuthResponse {
        val accessToken = jwtTokenProvider.generateAccessToken(userDetails)
        val refreshToken = jwtTokenProvider.generateRefreshToken(userDetails)
        return AuthResponse(accessToken, refreshToken)
    }

    private fun validateRefreshToken(refreshToken: String) {
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw InvalidTokenException("Invalid or expired refresh token")
        }
    }

    private fun UserDetails.toSpringUser(): User =
        User(email, password, emptyList())
}
