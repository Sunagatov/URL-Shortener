package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.auth.service.CurrentUserProvider
import com.zufar.urlshortener.users.dto.UserDetailsDto
import org.springframework.stereotype.Service

@Service
class UserDetailsProvider(private val currentUserProvider: CurrentUserProvider) {

    fun getUserDetails(): UserDetailsDto {
        val user = currentUserProvider.requireCurrentUser()

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
