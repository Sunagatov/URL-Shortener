package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.service.authentication.SignInService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class AuthSignInControllerTest {

    @Mock private lateinit var signInService: SignInService

    @Test
    fun `authenticateUser delegates to auth service`() {
        val controller = AuthSignInController(signInService)
        val request = SignInRequest("user@example.com", "password")
        val response = AuthResponse("access-token", "refresh-token")
        whenever(signInService.authenticate(request)).thenReturn(response)

        val result = controller.authenticateUser(request)

        verify(signInService).authenticate(request)
        assertEquals(response, result.body)
    }
}
