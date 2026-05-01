package com.zufar.urlshortener.auth.service.user

import com.zufar.urlshortener.auth.api.CurrentUserAccess
import com.zufar.urlshortener.auth.api.UserAccount
import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.EmailNormalizer
import com.zufar.urlshortener.shared.ANONYMOUS_USER
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.time.LocalDateTime

private const val UNAUTHENTICATED_MESSAGE = "User is not authenticated"
private const val AUTHENTICATED_USER_NOT_FOUND_MESSAGE = "Authenticated user not found"
private const val USER_NOT_FOUND_MESSAGE = "User not found"

@Service
class CurrentUserService(
    private val userRepository: UserRepository
) : CurrentUserAccess {

    override fun requireCurrentUser(): UserAccount {
        val normalizedEmail = EmailNormalizer.normalize(requireAuthenticatedEmail())

        val user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw UserNotFoundException(USER_NOT_FOUND_MESSAGE)

        return user.toUserAccount()
    }

    override fun requireCurrentUserId(): String = requireCurrentUser().id

    override fun getCurrentUserIdOrNull(): String? {
        val email = currentAuthenticationName() ?: return null
        val normalizedEmail = EmailNormalizer.normalize(email)
        val user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw AuthenticationCredentialsNotFoundException(AUTHENTICATED_USER_NOT_FOUND_MESSAGE)

        return user.id ?: throw AuthenticationCredentialsNotFoundException(AUTHENTICATED_USER_NOT_FOUND_MESSAGE)
    }

    override fun updatePassword(currentUser: UserAccount, encodedPassword: String, updatedAt: LocalDateTime) {
        userRepository.save(
            userRepository.findById(currentUser.id)
                .orElseThrow { UserNotFoundException(USER_NOT_FOUND_MESSAGE) }
                .copy(
                    password = encodedPassword,
                    tokenVersion = currentUser.tokenVersion + 1,
                    updatedAt = updatedAt
                )
        )
    }

    private fun requireAuthenticatedEmail(): String =
        currentAuthenticationName() ?: throw AuthenticationCredentialsNotFoundException(UNAUTHENTICATED_MESSAGE)

    private fun currentAuthenticationName(): String? {
        val authentication = SecurityContextHolder.getContext().authentication ?: return null
        val email = authentication.name

        return email.takeUnless { it.isBlank() || it == ANONYMOUS_USER }
    }

    private fun com.zufar.urlshortener.auth.entity.UserDetails.toUserAccount(): UserAccount {
        val userId = id ?: throw UserNotFoundException(USER_NOT_FOUND_MESSAGE)
        return UserAccount(
            id = userId,
            firstName = firstName,
            lastName = lastName,
            email = email,
            passwordHash = password,
            country = country,
            age = age,
            createdAt = createdAt,
            tokenVersion = tokenVersion
        )
    }
}
