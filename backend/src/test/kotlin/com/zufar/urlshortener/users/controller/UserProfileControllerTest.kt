package com.zufar.urlshortener.users.controller

import com.zufar.urlshortener.users.dto.UserDetailsDto
import com.zufar.urlshortener.users.service.UserDetailsProvider
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.LocalDateTime
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UserProfileControllerTest {

    @Mock private lateinit var userDetailsProvider: UserDetailsProvider

    @Test
    fun `getUserDetails delegates to details provider`() {
        val controller = UserProfileController(userDetailsProvider)
        val responseBody = UserDetailsDto(
            firstName = "Jane",
            lastName = "Doe",
            email = "jane@example.com",
            country = "USA",
            age = 28,
            createdAt = LocalDateTime.parse("2024-01-01T10:15:30")
        )
        whenever(userDetailsProvider.getUserDetails()).thenReturn(responseBody)

        val response = controller.getUserDetails()

        verify(userDetailsProvider).getUserDetails()
        assertEquals(responseBody, response.body)
    }
}
