package com.zufar.urlshortener.auth.service.user

import com.zufar.urlshortener.auth.security.UserDetailsWithTokenVersion
import com.zufar.urlshortener.auth.service.EmailNormalizer
import com.zufar.urlshortener.shared.ANONYMOUS_USER
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.time.Instant

private const val UNAUTHENTICATED_MESSAGE = "User is not authenticated"
private const val AUTHENTICATED_USER_NOT_FOUND_MESSAGE = "Authenticated user not found"
private const val USER_NOT_FOUND_MESSAGE = "User not found"
private const val USER_NOT_FOUND_CODE = "USER_NOT_FOUND"

@Service
class AuthenticatedUserContextService(
    private val userAccountRepository: UserAccountRepository
) {

    fun requireAuthenticatedUser(): UserAccountDocument {
        val normalizedEmail = EmailNormalizer.normalize(requireAuthenticatedEmail())

        return userAccountRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw ApplicationException.notFound(USER_NOT_FOUND_CODE, USER_NOT_FOUND_MESSAGE)
    }

    fun requireAuthenticatedUserId(): String =
        findAuthenticatedUserIdOrNull()
            ?: throw AuthenticationCredentialsNotFoundException(AUTHENTICATED_USER_NOT_FOUND_MESSAGE)

    fun findAuthenticatedUserIdOrNull(): String? {
        val authentication = currentAuthentication() ?: return null
        val principalUserId = (authentication.principal as? UserDetailsWithTokenVersion)?.userId
            ?.takeIf(String::isNotBlank)
        if (principalUserId != null) {
            return principalUserId
        }

        val normalizedEmail = EmailNormalizer.normalize(authentication.name)
        val user = userAccountRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw AuthenticationCredentialsNotFoundException(AUTHENTICATED_USER_NOT_FOUND_MESSAGE)

        return user.id ?: throw AuthenticationCredentialsNotFoundException(AUTHENTICATED_USER_NOT_FOUND_MESSAGE)
    }

    fun updatePassword(currentUser: UserAccountDocument, encodedPassword: String, updatedAt: Instant) {
        val userId = currentUser.id ?: throw ApplicationException.notFound(USER_NOT_FOUND_CODE, USER_NOT_FOUND_MESSAGE)
        val currentRecord = userAccountRepository.findById(userId)
            .orElseThrow { ApplicationException.notFound(USER_NOT_FOUND_CODE, USER_NOT_FOUND_MESSAGE) }
        userAccountRepository.save(
            currentRecord.copy(
                password = encodedPassword,
                tokenVersion = currentUser.tokenVersion + 1,
                updatedAt = updatedAt
            )
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
