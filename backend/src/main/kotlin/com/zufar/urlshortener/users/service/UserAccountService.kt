package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.security.AuthenticatedUserIdProvider
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.dto.UpdateProfileRequest
import com.zufar.urlshortener.users.dto.UserDetailsDto
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.Instant

private const val INVALID_USER_REQUEST_CODE = "INVALID_USER_REQUEST"
private const val USER_NOT_FOUND_CODE = "USER_NOT_FOUND"
private const val USER_NOT_FOUND_MESSAGE = "User not found"

@Service
class UserAccountService(
    private val authenticatedUserIdProvider: AuthenticatedUserIdProvider,
    private val userAccountRepository: UserAccountRepository,
    private val passwordEncoder: PasswordEncoder,
    private val clock: Clock
) {

    fun getCurrentUserDetails(): UserDetailsDto {
        val user = requireCurrentUser()
        return UserDetailsDto(
            firstName = user.firstName,
            lastName = user.lastName,
            email = user.email,
            country = user.country,
            age = user.age,
            authProvider = user.authProvider.name,
            createdAt = user.createdAt
        )
    }

    fun updateProfile(request: UpdateProfileRequest): UserDetailsDto {
        val user = requireCurrentUser()
        val updated = userAccountRepository.save(
            user.copy(
                firstName = request.firstName,
                lastName = request.lastName,
                country = request.country,
                age = request.age,
                updatedAt = Instant.now(clock)
            )
        )
        return UserDetailsDto(
            firstName = updated.firstName,
            lastName = updated.lastName,
            email = updated.email,
            country = updated.country,
            age = updated.age,
            authProvider = updated.authProvider.name,
            createdAt = updated.createdAt
        )
    }

    fun changePassword(request: ChangePasswordRequest) {
        val user = requireCurrentUser()

        if (user.password == null) {
            throw ApplicationException.badRequest(INVALID_USER_REQUEST_CODE, "Cannot change password for Google-authenticated accounts")
        }
        if (!passwordEncoder.matches(request.currentPassword, user.password)) {
            throw ApplicationException.badRequest(INVALID_USER_REQUEST_CODE, "Current password is incorrect")
        }
        val encodedPassword = requireNotNull(passwordEncoder.encode(request.newPassword)) {
            "Password encoder returned null during password change"
        }

        userAccountRepository.save(
            user.copy(
                password = encodedPassword,
                tokenVersion = user.tokenVersion + 1,
                updatedAt = Instant.now(clock)
            )
        )
    }

    private fun requireCurrentUser(): UserAccountDocument {
        val userId = authenticatedUserIdProvider.requireAuthenticatedUserId()
        return userAccountRepository.findById(userId)
            .orElseThrow { ApplicationException.notFound(USER_NOT_FOUND_CODE, USER_NOT_FOUND_MESSAGE) }
    }
}
