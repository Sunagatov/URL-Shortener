package com.zufar.urlshortener.auth.security

import jakarta.servlet.FilterChain
import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.MDC
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.io.IOException

private const val BEARER_PREFIX = "Bearer "
private const val AUTHENTICATED_USER_ID_ATTRIBUTE = "authenticatedUserId"

@Component
class JwtAuthenticationFilter(
    private val customUserDetailsService: CustomUserDetailsService,
    private val jwtTokenProvider: JwtTokenProvider
) : OncePerRequestFilter() {

    @Throws(ServletException::class, IOException::class)
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val jwt = extractBearerToken(request)

        if (jwt != null && SecurityContextHolder.getContext().authentication == null) {
            try {
                val username = jwtTokenProvider.getUsernameFromValidAccessToken(jwt)
                if (username != null) {
                    val userDetails: UserDetails = customUserDetailsService.loadUserByUsername(username)
                    val authentication = UsernamePasswordAuthenticationToken(userDetails, null, userDetails.authorities)
                    authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
                    SecurityContextHolder.getContext().authentication = authentication
                    val internalUserId = (userDetails as? UserDetailsWithTokenVersion)?.userId
                    if (!internalUserId.isNullOrBlank()) {
                        MDC.put("userId", internalUserId)
                        request.setAttribute(AUTHENTICATED_USER_ID_ATTRIBUTE, internalUserId)
                    }
                }
            } catch (_: AuthenticationException) {
                SecurityContextHolder.clearContext()
            }
        }

        try {
            filterChain.doFilter(request, response)
        } finally {
            MDC.remove("userId")
            request.removeAttribute(AUTHENTICATED_USER_ID_ATTRIBUTE)
        }
    }

    private fun extractBearerToken(request: HttpServletRequest): String? =
        request.getHeader("Authorization")
            ?.takeIf { it.startsWith(BEARER_PREFIX) }
            ?.removePrefix(BEARER_PREFIX)
}
