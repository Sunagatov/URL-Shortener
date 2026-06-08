package com.zufar.urlshortener.shared.filter

import com.zufar.urlshortener.shared.ACTUATOR_PATH_PREFIX
import com.zufar.urlshortener.shared.API_DOCS_PATH_PREFIX
import com.zufar.urlshortener.shared.DOCS_PATH_PREFIX
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

private const val CONTENT_SECURITY_POLICY =
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"

@Component
@Order(1)
class SecurityHeadersFilter : OncePerRequestFilter() {
    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.requestURI
        return path.startsWith(ACTUATOR_PATH_PREFIX) ||
            path.startsWith(DOCS_PATH_PREFIX) ||
            path.startsWith(API_DOCS_PATH_PREFIX)
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        response.setHeader("X-Content-Type-Options", "nosniff")
        response.setHeader("X-Frame-Options", "DENY")
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
        response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")
        response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
        response.setHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY)
        filterChain.doFilter(request, response)
    }
}
