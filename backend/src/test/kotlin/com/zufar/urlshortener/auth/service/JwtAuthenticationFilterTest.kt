package com.zufar.urlshortener.auth.service

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import org.springframework.mock.web.MockFilterChain
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UsernameNotFoundException
import kotlin.test.assertEquals
import kotlin.test.assertNull

class JwtAuthenticationFilterTest {

    private val customUserDetailsService: CustomUserDetailsService = mock()
    private val jwtTokenProvider: JwtTokenProvider = mock()
    private val filter = JwtAuthenticationFilter(customUserDetailsService, jwtTokenProvider)

    @BeforeEach
    fun setUp() {
        SecurityContextHolder.clearContext()
    }

    @AfterEach
    fun tearDown() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `valid access token and existing user authenticates context`() {
        val token = "valid-token"
        val userDetails = User("user@example.com", "password", emptyList())
        whenever(jwtTokenProvider.getUsernameFromValidAccessToken(token)).thenReturn("user@example.com")
        whenever(customUserDetailsService.loadUserByUsername("user@example.com")).thenReturn(userDetails)
        val request = requestWithBearerToken(token)

        filter.doFilter(request, MockHttpServletResponse(), MockFilterChain())

        assertEquals("user@example.com", SecurityContextHolder.getContext().authentication.name)
    }

    @Test
    fun `valid access token and missing user does not throw and leaves context empty`() {
        val token = "valid-token"
        whenever(jwtTokenProvider.getUsernameFromValidAccessToken(token)).thenReturn("missing@example.com")
        whenever(customUserDetailsService.loadUserByUsername("missing@example.com"))
            .thenThrow(UsernameNotFoundException("missing"))
        val request = requestWithBearerToken(token)

        filter.doFilter(request, MockHttpServletResponse(), MockFilterChain())

        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `invalid token does not authenticate`() {
        val token = "invalid-token"
        whenever(jwtTokenProvider.getUsernameFromValidAccessToken(token)).thenReturn(null)
        val request = requestWithBearerToken(token)

        filter.doFilter(request, MockHttpServletResponse(), MockFilterChain())

        assertNull(SecurityContextHolder.getContext().authentication)
        verify(jwtTokenProvider).getUsernameFromValidAccessToken(token)
        verifyNoInteractions(customUserDetailsService)
    }

    private fun requestWithBearerToken(token: String): MockHttpServletRequest {
        val request = MockHttpServletRequest()
        request.addHeader("Authorization", "Bearer $token")
        return request
    }
}
