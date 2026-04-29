package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.ChangePasswordRequest
import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.validator.AuthRequestValidator
import com.zufar.urlshortener.common.exception.InvalidRequestException
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class UserPasswordChanger(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authRequestValidator: AuthRequestValidator
) {

    fun changePassword(changePasswordRequest: ChangePasswordRequest) {
        authRequestValidator.validateChangePasswordRequest(changePasswordRequest)

        val authentication = SecurityContextHolder.getContext().authentication
        val email = authentication?.name ?: throw AuthenticationCredentialsNotFoundException("User is not authenticated")
        if (email.isBlank() || email == "anonymousUser") {
            throw AuthenticationCredentialsNotFoundException("User is not authenticated")
        }

        val normalizedEmail = EmailNormalizer.normalize(email)
        val user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw UserNotFoundException("User not found")

        if (!passwordEncoder.matches(changePasswordRequest.currentPassword, user.password)) {
            throw InvalidRequestException("Current password is incorrect")
        }

        val updatedUser = user.copy(
            password = passwordEncoder.encode(changePasswordRequest.newPassword),
            updatedAt = LocalDateTime.now()
        )

        userRepository.save(updatedUser)
    }
}
