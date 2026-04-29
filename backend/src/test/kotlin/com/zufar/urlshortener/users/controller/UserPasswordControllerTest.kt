package com.zufar.urlshortener.users.controller

import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.service.UserPasswordChanger
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UserPasswordControllerTest {

    @Mock private lateinit var userPasswordChanger: UserPasswordChanger

    @Test
    fun `changePassword delegates to password changer`() {
        val controller = UserPasswordController(userPasswordChanger)
        val request = ChangePasswordRequest(
            currentPassword = "OldPassword1!",
            newPassword = "NewPassword1!"
        )

        val response = controller.changePassword(request)

        verify(userPasswordChanger).changePassword(request)
        assertEquals(204, response.statusCode.value())
    }
}
