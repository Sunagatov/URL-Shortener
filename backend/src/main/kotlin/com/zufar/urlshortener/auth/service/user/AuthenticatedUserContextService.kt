package com.zufar.urlshortener.auth.service.user

import com.zufar.urlshortener.auth.api.AuthenticatedUserContext
import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.auth.security.UserDetailsWithTokenVersion
import com.zufar.urlshortener.auth.service.EmailNormalizer
import com.zufar.urlshortener.shared.ANONYMOUS_USER
import com.zufar.urlshortener.users.api.UserAccountRecord
import com.zufar.urlshortener.users.api.UserAuthStore
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.time.LocalDateTime

private const val UNAUTHENTICATED_MESSAGE = "User is not authenticated"
private const val AUTHENTICATED_USER_NOT_FOUND_MESSAGE = "Authenticated user not found"
private const val USER_NOT_FOUND_MESSAGE = "User not found"

@Service
class AuthenticatedUserContextService(
    private val userAuthStore: UserAuthStore
) : AuthenticatedUserContext {

    override fun requireAuthenticatedUser(): UserAccountRecord {
        val normalizedEmail = EmailNormalizer.normalize(requireAuthenticatedEmail())

        return userAuthStore.findByEmailIgnoreCase(normalizedEmail)
            ?: throw UserNotFoundException(USER_NOT_FOUND_MESSAGE)
    }

    override fun requireAuthenticatedUserId(): String =
        findAuthenticatedUserIdOrNull()
            ?: throw AuthenticationCredentialsNotFoundException(AUTHENTICATED_USER_NOT_FOUND_MESSAGE)

    override fun findAuthenticatedUserIdOrNull(): String? {
        val authentication = currentAuthentication() ?: return null
        val principalUserId = (authentication.principal as? UserDetailsWithTokenVersion)?.userId
            ?.takeIf(String::isNotBlank)
        if (principalUserId != null) {
            return principalUserId
        }

        val normalizedEmail = EmailNormalizer.normalize(authentication.name)
        val user = userAuthStore.findByEmailIgnoreCase(normalizedEmail)
            ?: throw AuthenticationCredentialsNotFoundException(AUTHENTICATED_USER_NOT_FOUND_MESSAGE)

        return user.id ?: throw AuthenticationCredentialsNotFoundException(AUTHENTICATED_USER_NOT_FOUND_MESSAGE)
    }

    override fun updatePassword(currentUser: UserAccountRecord, encodedPassword: String, updatedAt: LocalDateTime) {
        val userId = currentUser.id ?: throw UserNotFoundException(USER_NOT_FOUND_MESSAGE)
        userAuthStore.updatePassword(
            userId,
            encodedPassword,
            currentUser.tokenVersion + 1,
            updatedAt
        )
    }

    private fun requireAuthenticatedEmail(): String =
        currentAuthenticationName() ?: throw AuthenticationCredentialsNotFoundException(UNAUTHENTICATED_MESSAGE)

    private fun currentAuthentication(): Authentication? =
        SecurityContextHolder.getContext().authentication
            ?.takeUnless { it.name.isBlank() || it.name == ANONYMOUS_USER }

    private fun currentAuthenticationName(): String? {
        val authentication = currentAuthentication() ?: return null
        return authentication.name
    }
}
