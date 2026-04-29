package com.zufar.urlshortener.auth.service.registration

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.auth.entity.UserDetails
import com.zufar.urlshortener.auth.exception.EmailAlreadyExistsException
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.EmailNormalizer
import com.zufar.urlshortener.auth.service.support.AuthTokenIssuer
import com.zufar.urlshortener.auth.validation.AuthRequestValidator
import org.springframework.dao.DuplicateKeyException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

@Service
class SignUpService(
    private val authRequestValidator: AuthRequestValidator,
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authTokenIssuer: AuthTokenIssuer,
    private val clock: Clock
) {

    fun register(signUpRequest: SignUpRequest): AuthResponse {
        val normalizedRequest = signUpRequest.copy(email = EmailNormalizer.normalize(signUpRequest.email))
        authRequestValidator.validateSignUpRequest(normalizedRequest)
        ensureEmailIsAvailable(normalizedRequest.email)

        val user = saveUser(buildUser(normalizedRequest))
        return authTokenIssuer.issueAuthentication(user)
    }

    private fun ensureEmailIsAvailable(email: String) {
        if (userRepository.findByEmailIgnoreCase(email) != null) {
            throw EmailAlreadyExistsException("Email is already in use")
        }
    }

    private fun buildUser(signUpRequest: SignUpRequest): UserDetails {
        val now = LocalDateTime.now(clock)

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

    private fun saveUser(user: UserDetails): UserDetails =
        try {
            userRepository.save(user)
        } catch (_: DuplicateKeyException) {
            throw EmailAlreadyExistsException("Email is already in use")
        }
}
