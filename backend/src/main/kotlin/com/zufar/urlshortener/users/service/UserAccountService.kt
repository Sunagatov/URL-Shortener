package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.user.CurrentUserService
import com.zufar.urlshortener.auth.validation.AuthRequestValidator
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.dto.UserDetailsDto
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

@Service
class UserAccountService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authRequestValidator: AuthRequestValidator,
    private val currentUserService: CurrentUserService,
    private val clock: Clock
) {

    fun getCurrentUserDetails(): UserDetailsDto {
        val user = currentUserService.requireCurrentUser()
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
        authRequestValidator.validateChangePasswordRequest(request)
        val user = currentUserService.requireCurrentUser()

        if (!passwordEncoder.matches(request.currentPassword, user.password)) {
            throw InvalidRequestException("Current password is incorrect")
        }

        val encodedPassword = requireNotNull(passwordEncoder.encode(request.newPassword)) {
            "Password encoder returned null during password change"
        }

        userRepository.save(
            user.copy(
                password = encodedPassword,
                tokenVersion = user.tokenVersion + 1,
                updatedAt = LocalDateTime.now(clock)
            )
        )
    }
}
