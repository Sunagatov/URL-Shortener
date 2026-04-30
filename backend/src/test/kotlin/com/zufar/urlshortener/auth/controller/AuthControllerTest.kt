package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenResponse
import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.auth.service.AuthService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class AuthControllerTest {

    @Mock private lateinit var authService: AuthService

    @Test
    fun `authenticateUser delegates to auth service`() {
        val controller = AuthController(authService)
        val request = SignInRequest("user@example.com", "password")
        val response = AuthResponse("access-token", "refresh-token")
        whenever(authService.signIn(request)).thenReturn(response)

        val result = controller.authenticateUser(request)

        verify(authService).signIn(request)
        assertEquals(response, result.body)
    }

    @Test
    fun `registerUser delegates to auth service`() {
        val controller = AuthController(authService)
        val request = SignUpRequest(
            firstName = "Jane",
            lastName = "Doe",
            country = "USA",
            age = 28,
            email = "jane@example.com",
            password = "SecurePassword123!"
        )
        val response = AuthResponse("access-token", "refresh-token")
        whenever(authService.signUp(request)).thenReturn(response)

        val result = controller.registerUser(request)

        verify(authService).signUp(request)
        assertEquals(response, result.body)
    }

    @Test
    fun `refreshAccessToken delegates to auth service`() {
        val controller = AuthController(authService)
        val request = RefreshTokenRequest("refresh-token")
        val response = RefreshTokenResponse("new-access-token")
        whenever(authService.refreshAccessToken(request)).thenReturn(response)

        val result = controller.refreshAccessToken(request)

        verify(authService).refreshAccessToken(request)
        assertEquals(response, result.body)
    }
}
