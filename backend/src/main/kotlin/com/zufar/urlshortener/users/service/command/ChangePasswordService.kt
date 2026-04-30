package com.zufar.urlshortener.users.service.command

import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.user.CurrentUserService
import com.zufar.urlshortener.auth.validation.AuthRequestValidator
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

@Service
class ChangePasswordService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authRequestValidator: AuthRequestValidator,
    private val currentUserService: CurrentUserService,
    private val clock: Clock
) {

    fun changePassword(changePasswordRequest: ChangePasswordRequest) {
        authRequestValidator.validateChangePasswordRequest(changePasswordRequest)
        val user = currentUserService.requireCurrentUser()

        if (!passwordEncoder.matches(changePasswordRequest.currentPassword, user.password)) {
            throw InvalidRequestException("Current password is incorrect")
        }

        val encodedPassword = requireNotNull(passwordEncoder.encode(changePasswordRequest.newPassword)) {
            "Password encoder returned null during password change"
        }

        val updatedUser = user.copy(
            password = encodedPassword,
            tokenVersion = user.tokenVersion + 1,
            updatedAt = LocalDateTime.now(clock)
        )

        userRepository.save(updatedUser)
    }
}
