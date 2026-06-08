package com.zufar.urlshortener.auth.service.user

import com.zufar.urlshortener.auth.security.UserDetailsWithTokenVersion
import com.zufar.urlshortener.auth.service.EmailNormalizer
import com.zufar.urlshortener.shared.ANONYMOUS_USER
import com.zufar.urlshortener.shared.security.AuthenticatedUserIdProvider
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

private const val AUTHENTICATED_USER_NOT_FOUND_MESSAGE = "Authenticated user not found"

@Service
class AuthenticatedUserContextService(
    private val userAccountRepository: UserAccountRepository
) : AuthenticatedUserIdProvider {

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
        val user = userAccountRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw AuthenticationCredentialsNotFoundException(AUTHENTICATED_USER_NOT_FOUND_MESSAGE)

        return user.id ?: throw AuthenticationCredentialsNotFoundException(AUTHENTICATED_USER_NOT_FOUND_MESSAGE)
    }

    private fun currentAuthentication(): Authentication? =
        SecurityContextHolder.getContext().authentication
            ?.takeUnless { it.name.isBlank() || it.name == ANONYMOUS_USER }

}
