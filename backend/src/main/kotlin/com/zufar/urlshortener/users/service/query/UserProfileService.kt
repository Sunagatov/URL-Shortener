package com.zufar.urlshortener.users.service.query

import com.zufar.urlshortener.auth.service.user.CurrentUserService
import com.zufar.urlshortener.users.dto.UserDetailsDto
import org.springframework.stereotype.Service

@Service
class UserProfileService(
    private val currentUserService: CurrentUserService
) {

    fun getUserDetails(): UserDetailsDto {
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
}
