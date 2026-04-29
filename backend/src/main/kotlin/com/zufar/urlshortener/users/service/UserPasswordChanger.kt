package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.CurrentUserProvider
import com.zufar.urlshortener.auth.service.validator.AuthRequestValidator
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class UserPasswordChanger(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authRequestValidator: AuthRequestValidator,
    private val currentUserProvider: CurrentUserProvider
) {

    fun changePassword(changePasswordRequest: ChangePasswordRequest) {
        authRequestValidator.validateChangePasswordRequest(changePasswordRequest)
        val user = currentUserProvider.requireCurrentUser()

        if (!passwordEncoder.matches(changePasswordRequest.currentPassword, user.password)) {
            throw InvalidRequestException("Current password is incorrect")
        }

        val updatedUser = user.copy(
            password = passwordEncoder.encode(changePasswordRequest.newPassword),
            tokenVersion = user.tokenVersion + 1,
            updatedAt = LocalDateTime.now()
        )

        userRepository.save(updatedUser)
    }
}
