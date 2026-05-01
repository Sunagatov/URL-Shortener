package com.zufar.urlshortener.auth.security

import com.zufar.urlshortener.auth.service.EmailNormalizer
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class CustomUserDetailsService(
    private val userAccountRepository: UserAccountRepository
) : UserDetailsService {

    override fun loadUserByUsername(email: String): UserDetails {
        val normalizedEmail = EmailNormalizer.normalize(email)
        val user = userAccountRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw UsernameNotFoundException("User with email='$normalizedEmail' is not found")

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.email)
            .password(user.password)
            .authorities(emptyList())
            .build()
            .withTokenVersion(user.tokenVersion, user.id, user.emailVerified)
    }
}
