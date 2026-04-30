package com.zufar.urlshortener.shared.filter

import com.zufar.urlshortener.shared.config.RateLimitConfig
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.servlet.HandlerMapping

private const val ANONYMOUS_USER = "anonymousUser"
private const val AUTHENTICATED_USER_ID_ATTRIBUTE = "authenticatedUserId"
private const val OUTCOME_TEMPLATE = "http.request.completed: method={}, path={}, status={}, duration_ms={}, client_ip={}, authenticated={}, outcome={}"

@Component
@Order(2)
class RequestCompletionLoggingFilter(
    private val rateLimitConfig: RateLimitConfig,
    @Value("\${logging.slow-request-threshold-ms:1000}") private val slowRequestThresholdMs: Long
) : OncePerRequestFilter() {

    private val accessLog = LoggerFactory.getLogger("http.access")

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.requestURI
        return request.method.equals("OPTIONS", ignoreCase = true) ||
            path.startsWith("/actuator") ||
            path.startsWith("/api/v1/docs") ||
            path.startsWith("/api/v1/api-docs")
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val startedAt = System.currentTimeMillis()

        try {
            filterChain.doFilter(request, response)
        } finally {
            logRequestCompletion(request, response, System.currentTimeMillis() - startedAt)
        }
    }

    private fun logRequestCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        durationMs: Long
    ) {
        val path = resolvePath(request)
        val status = response.status
        val authenticated = isAuthenticated(request)
        val args = arrayOf(
            request.method,
            path,
            status,
            durationMs,
            resolveClientIp(request),
            authenticated,
            resolveOutcome(status)
        )

        when {
            status >= 500 -> accessLog.error(OUTCOME_TEMPLATE, *args)
            status == HttpServletResponse.SC_NOT_FOUND && isPublicInternetNoise(path) -> accessLog.debug(OUTCOME_TEMPLATE, *args)
            status >= 400 || durationMs >= slowRequestThresholdMs -> accessLog.warn(OUTCOME_TEMPLATE, *args)
            else -> accessLog.info(OUTCOME_TEMPLATE, *args)
        }
    }

    private fun isAuthenticated(request: HttpServletRequest): Boolean =
        request.getAttribute(AUTHENTICATED_USER_ID_ATTRIBUTE) != null ||
            request.userPrincipal?.name?.takeUnless { it.isBlank() || it == ANONYMOUS_USER } != null

    private fun resolvePath(request: HttpServletRequest): String {
        val pattern = request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE)?.toString()
        val resolved = pattern
            ?.takeUnless { it == "/**" }
            ?: request.requestURI

        return resolved.replace(Regex("[\\r\\n]"), "_")
    }

    private fun resolveClientIp(request: HttpServletRequest): String {
        val forwardedFor = request.getHeader("X-Forwarded-For")
            ?.takeIf { rateLimitConfig.isTrustedProxy(request.remoteAddr) }
            ?.split(",")
            ?.firstNotNullOfOrNull { it.trim().takeIf(String::isNotEmpty) }

        return forwardedFor ?: request.remoteAddr
    }

    private fun resolveOutcome(status: Int): String = when {
        status < 400 -> "SUCCESS"
        status < 500 -> "CLIENT_ERROR"
        else -> "SERVER_ERROR"
    }

    private fun isPublicInternetNoise(path: String): Boolean =
        !path.startsWith("/api/") && !path.startsWith("/actuator/")
}
