package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.shorten.dto.UserDetailsDto
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class UserDetailsProvider(private val userRepository: UserRepository) {

    fun getUserDetails(): UserDetailsDto {
        val authentication = SecurityContextHolder.getContext().authentication
        val email = authentication?.name ?: throw IllegalStateException("User is not authenticated")
        val user = userRepository.findByEmail(email) ?: throw IllegalStateException("User not found")

        return UserDetailsDto(
            firstName = user.firstName,
            lastName = user.lastName,
            email = user.email,
            country = user.country,
            age = user.age
        )
    }
}
