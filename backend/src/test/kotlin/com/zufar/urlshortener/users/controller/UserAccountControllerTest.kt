package com.zufar.urlshortener.users.controller

import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.dto.UserDetailsDto
import com.zufar.urlshortener.users.service.UserAccountService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.Instant
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UserAccountControllerTest {

    @Mock private lateinit var userAccountService: UserAccountService

    @Test
    fun `getUserDetails delegates to account service`() {
        val controller = UserAccountController(userAccountService)
        val responseBody = UserDetailsDto(
            firstName = "Jane",
            lastName = "Doe",
            email = "jane@example.com",
            country = "USA",
            age = 28,
            createdAt = Instant.parse("2024-01-01T10:15:30Z")
        )
        whenever(userAccountService.getCurrentUserDetails()).thenReturn(responseBody)

        val response = controller.getUserDetails()

        verify(userAccountService).getCurrentUserDetails()
        assertEquals(responseBody, response.body)
    }

    @Test
    fun `changePassword delegates to account service`() {
        val controller = UserAccountController(userAccountService)
        val request = ChangePasswordRequest(
            currentPassword = "OldPassword1!",
            newPassword = "NewPassword1!"
        )

        val response = controller.changePassword(request)

        verify(userAccountService).changePassword(request)
        assertEquals(204, response.statusCode.value())
    }
}
