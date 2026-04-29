package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.EmailNormalizer
import com.zufar.urlshortener.users.dto.UserDetailsDto
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class UserDetailsProvider(private val userRepository: UserRepository) {

    fun getUserDetails(): UserDetailsDto {
        val authentication = SecurityContextHolder.getContext().authentication
        val email = authentication?.name ?: throw AuthenticationCredentialsNotFoundException("User is not authenticated")
        if (email.isBlank() || email == "anonymousUser") {
            throw AuthenticationCredentialsNotFoundException("User is not authenticated")
        }
        val normalizedEmail = EmailNormalizer.normalize(email)
        val user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw UserNotFoundException("User not found")

        return UserDetailsDto(
            firstName = user.firstName,
            lastName = user.lastName,
            email = user.email,
            country = user.country,
            age = user.age,
            createdAt = user.createdAt
        )
    }
}
