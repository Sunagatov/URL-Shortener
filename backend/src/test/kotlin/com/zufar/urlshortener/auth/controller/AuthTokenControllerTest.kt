package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenResponse
import com.zufar.urlshortener.auth.service.token.RefreshAccessTokenService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class AuthTokenControllerTest {

    @Mock private lateinit var refreshAccessTokenService: RefreshAccessTokenService

    @Test
    fun `refreshAccessToken delegates to auth service`() {
        val controller = AuthTokenController(refreshAccessTokenService)
        val request = RefreshTokenRequest("refresh-token")
        val response = RefreshTokenResponse("new-access-token")
        whenever(refreshAccessTokenService.refresh(request)).thenReturn(response)

        val result = controller.refreshAccessToken(request)

        verify(refreshAccessTokenService).refresh(request)
        assertEquals(response, result.body)
    }
}
