package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.auth.api.AuthenticatedUserContext
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.dto.UserDetailsDto
import com.zufar.urlshortener.users.exception.InvalidUserRequestException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

@Service
class UserAccountService(
    private val authenticatedUserContext: AuthenticatedUserContext,
    private val passwordEncoder: PasswordEncoder,
    private val clock: Clock
) {

    fun getCurrentUserDetails(): UserDetailsDto {
        val user = authenticatedUserContext.requireAuthenticatedUser()
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
        val user = authenticatedUserContext.requireAuthenticatedUser()

        if (!passwordEncoder.matches(request.currentPassword, user.password)) {
            throw InvalidUserRequestException("Current password is incorrect")
        }
        val encodedPassword = requireNotNull(passwordEncoder.encode(request.newPassword)) {
            "Password encoder returned null during password change"
        }

        authenticatedUserContext.updatePassword(user, encodedPassword, LocalDateTime.now(clock))
    }
}
