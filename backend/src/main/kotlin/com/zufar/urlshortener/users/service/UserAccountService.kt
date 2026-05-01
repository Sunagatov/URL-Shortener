package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.dto.UserDetailsDto
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

private const val INVALID_USER_REQUEST_CODE = "INVALID_USER_REQUEST"

@Service
class UserAccountService(
    private val authenticatedUserContext: AuthenticatedUserContextService,
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
            throw ApplicationException.badRequest(INVALID_USER_REQUEST_CODE, "Current password is incorrect")
        }
        val encodedPassword = requireNotNull(passwordEncoder.encode(request.newPassword)) {
            "Password encoder returned null during password change"
        }

        authenticatedUserContext.updatePassword(user, encodedPassword, LocalDateTime.now(clock))
    }
}
