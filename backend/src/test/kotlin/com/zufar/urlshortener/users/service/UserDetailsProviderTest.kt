package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.Clock
import java.time.LocalDateTime
import kotlin.test.assertEquals

class UserDetailsProviderTest {

    private val authenticatedUserContext: AuthenticatedUserContextService = mock()
    private val userAccountRepository: UserAccountRepository = mock()
    private val userProfileService = UserAccountService(
        authenticatedUserContext = authenticatedUserContext,
        userAccountRepository = userAccountRepository,
        passwordEncoder = mock(),
        clock = Clock.systemUTC()
    )

    @Test
    fun `getUserDetails returns createdAt for authenticated user`() {
        val createdAt = LocalDateTime.of(2024, 1, 15, 10, 0)
        whenever(authenticatedUserContext.requireAuthenticatedUser()).thenReturn(
            UserAccountDocument(
                id = "user-1",
                firstName = "Test",
                lastName = "User",
                email = "user@example.com",
                password = "hashed",
                country = "USA",
                age = 30,
                createdAt = createdAt,
                tokenVersion = 0
            )
        )

        val result = userProfileService.getCurrentUserDetails()

        assertEquals("Test", result.firstName)
        assertEquals(createdAt, result.createdAt)
    }
}
