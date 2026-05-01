package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.auth.api.CurrentUserAccess
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.dto.UserDetailsDto
import com.zufar.urlshortener.users.validation.ChangePasswordValidator
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

@Service
class UserAccountService(
    private val currentUserAccess: CurrentUserAccess,
    private val passwordEncoder: PasswordEncoder,
    private val changePasswordValidator: ChangePasswordValidator,
    private val clock: Clock
) {

    fun getCurrentUserDetails(): UserDetailsDto {
        val user = currentUserAccess.requireCurrentUser()
        return UserDetailsDto(
            firstName = user.firstName,
            lastName = user.lastName,
            email = user.email,
            country = user.country,
            age = user.age,
            createdAt = user.createdAt
        )
    }

    fun changePassword(request: ChangePasswordRequest) {
        changePasswordValidator.validate(request)
        val user = currentUserAccess.requireCurrentUser()

        if (!passwordEncoder.matches(request.currentPassword, user.passwordHash)) {
            throw InvalidRequestException("Current password is incorrect")
        }

        val encodedPassword = requireNotNull(passwordEncoder.encode(request.newPassword)) {
            "Password encoder returned null during password change"
        }

        currentUserAccess.updatePassword(user, encodedPassword, LocalDateTime.now(clock))
    }
}
