package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.auth.entity.UserDetails
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.user.CurrentUserService
import com.zufar.urlshortener.users.service.query.UserProfileService
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.springframework.security.authentication.TestingAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import java.time.LocalDateTime
import kotlin.test.assertEquals

class UserDetailsProviderTest {

    private val userRepository: UserRepository = mock()
    private val userProfileService = UserProfileService(CurrentUserService(userRepository))

    @AfterEach
    fun tearDown() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `getUserDetails returns createdAt for authenticated user`() {
        val createdAt = LocalDateTime.of(2024, 1, 15, 10, 0)
        SecurityContextHolder.getContext().authentication =
            TestingAuthenticationToken("User@Example.COM", "")
        whenever(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(
            UserDetails(
                id = "user-1",
                firstName = "Test",
                lastName = "User",
                email = "user@example.com",
                password = "hashed",
                country = "USA",
                age = 30,
                createdAt = createdAt
            )
        )

        val result = userProfileService.getUserDetails()

        assertEquals("Test", result.firstName)
        assertEquals(createdAt, result.createdAt)
    }
}
