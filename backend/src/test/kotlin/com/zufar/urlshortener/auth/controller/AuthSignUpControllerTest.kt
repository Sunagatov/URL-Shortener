package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.auth.service.registration.SignUpService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class AuthSignUpControllerTest {

    @Mock private lateinit var signUpService: SignUpService

    @Test
    fun `registerUser delegates to auth service`() {
        val controller = AuthSignUpController(signUpService)
        val request = SignUpRequest(
            firstName = "Jane",
            lastName = "Doe",
            country = "USA",
            age = 28,
            email = "jane@example.com",
            password = "SecurePassword123!"
        )
        val response = AuthResponse("access-token", "refresh-token")
        whenever(signUpService.register(request)).thenReturn(response)

        val result = controller.registerUser(request)

        verify(signUpService).register(request)
        assertEquals(response, result.body)
    }
}
