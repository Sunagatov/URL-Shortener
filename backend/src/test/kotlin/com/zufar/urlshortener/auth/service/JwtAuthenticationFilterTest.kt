package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.security.CustomUserDetailsService
import com.zufar.urlshortener.auth.security.JwtAuthenticationFilter
import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.auth.security.withTokenVersion
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.slf4j.MDC
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import org.springframework.mock.web.MockFilterChain
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UsernameNotFoundException
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

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
        MDC.clear()
    }

    @Test
    fun `valid access token and existing user authenticates context`() {
        val token = "valid-token"
        val userDetails = User("user@example.com", "password", emptyList())
            .withTokenVersion(tokenVersion = 1, userId = "user-123")
        whenever(jwtTokenProvider.getUsernameFromValidAccessToken(token)).thenReturn("user@example.com")
        whenever(customUserDetailsService.loadUserByUsername("user@example.com")).thenReturn(userDetails)
        val request = requestWithBearerToken(token)

        filter.doFilter(request, MockHttpServletResponse(), MockFilterChain())

        assertEquals("user@example.com", SecurityContextHolder.getContext().authentication?.name)
        assertNull(MDC.get("userId"))
    }

    @Test
    fun `valid access token exposes internal user id to downstream request scope`() {
        val token = "valid-token"
        val userDetails = User("user@example.com", "password", emptyList())
            .withTokenVersion(tokenVersion = 1, userId = "user-123")
        whenever(jwtTokenProvider.getUsernameFromValidAccessToken(token)).thenReturn("user@example.com")
        whenever(customUserDetailsService.loadUserByUsername("user@example.com")).thenReturn(userDetails)
        val request = requestWithBearerToken(token)

        filter.doFilter(request, MockHttpServletResponse(), object : FilterChain {
            override fun doFilter(request: ServletRequest, response: ServletResponse) {
                assertEquals("user-123", request.getAttribute("authenticatedUserId"))
                assertEquals("user-123", MDC.get("userId"))
            }
        })

        assertNull(request.getAttribute("authenticatedUserId"))
        assertNull(MDC.get("userId"))
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

    @Test
    fun `request without bearer token skips authentication lookup`() {
        val request = MockHttpServletRequest().apply {
            addHeader("Authorization", "Basic abc123")
        }

        filter.doFilter(request, MockHttpServletResponse(), MockFilterChain())

        assertNull(SecurityContextHolder.getContext().authentication)
        verifyNoInteractions(jwtTokenProvider, customUserDetailsService)
    }

    private fun requestWithBearerToken(token: String): MockHttpServletRequest {
        val request = MockHttpServletRequest()
        request.addHeader("Authorization", "Bearer $token")
        return request
    }
}
