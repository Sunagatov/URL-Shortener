package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.shared.security.AuthenticatedUserIdProvider
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.Clock
import java.time.Instant
import java.util.Optional
import kotlin.test.assertEquals

class UserDetailsProviderTest {

    private val authenticatedUserIdProvider: AuthenticatedUserIdProvider = mock()
    private val userAccountRepository: UserAccountRepository = mock()
    private val userProfileService = UserAccountService(
        authenticatedUserIdProvider = authenticatedUserIdProvider,
        userAccountRepository = userAccountRepository,
        passwordEncoder = mock(),
        clock = Clock.systemUTC()
    )

    @Test
    fun `getUserDetails returns createdAt for authenticated user`() {
        val createdAt = Instant.parse("2024-01-15T10:00:00Z")
        whenever(authenticatedUserIdProvider.requireAuthenticatedUserId()).thenReturn("user-1")
        whenever(userAccountRepository.findById("user-1")).thenReturn(
            Optional.of(UserAccountDocument(
                id = "user-1",
                firstName = "Test",
                lastName = "User",
                email = "user@example.com",
                password = "hashed",
                country = "USA",
                age = 30,
                createdAt = createdAt,
                tokenVersion = 0
            ))
        )

        val result = userProfileService.getCurrentUserDetails()

        assertEquals("Test", result.firstName)
        assertEquals(createdAt, result.createdAt)
    }
}
