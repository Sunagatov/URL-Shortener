package com.zufar.urlshortener.auth.service.user

import com.zufar.urlshortener.auth.entity.UserDetails
import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.EmailNormalizer
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

private const val ANONYMOUS_USER = "anonymousUser"
private const val UNAUTHENTICATED_MESSAGE = "User is not authenticated"
private const val AUTHENTICATED_USER_NOT_FOUND_MESSAGE = "Authenticated user not found"
private const val USER_NOT_FOUND_MESSAGE = "User not found"

@Service
class CurrentUserService(
    private val userRepository: UserRepository
) {

    fun requireCurrentUser(): UserDetails {
        val normalizedEmail = EmailNormalizer.normalize(requireAuthenticatedEmail())

        return userRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw UserNotFoundException(USER_NOT_FOUND_MESSAGE)
    }

    fun requireCurrentUserId(): String =
        requireCurrentUser().id ?: throw UserNotFoundException(USER_NOT_FOUND_MESSAGE)

    fun getCurrentUserIdOrNull(): String? {
        val email = currentAuthenticationName() ?: return null
        val normalizedEmail = EmailNormalizer.normalize(email)
        val user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw AuthenticationCredentialsNotFoundException(AUTHENTICATED_USER_NOT_FOUND_MESSAGE)

        return user.id ?: throw AuthenticationCredentialsNotFoundException(AUTHENTICATED_USER_NOT_FOUND_MESSAGE)
    }

    private fun requireAuthenticatedEmail(): String =
        currentAuthenticationName() ?: throw AuthenticationCredentialsNotFoundException(UNAUTHENTICATED_MESSAGE)

    private fun currentAuthenticationName(): String? {
        val authentication = SecurityContextHolder.getContext().authentication ?: return null
        val email = authentication.name

        return email.takeUnless { it.isBlank() || it == ANONYMOUS_USER }
    }
}
