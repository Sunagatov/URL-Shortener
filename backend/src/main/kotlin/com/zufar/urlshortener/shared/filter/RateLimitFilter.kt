package com.zufar.urlshortener.shared.filter

import com.github.benmanes.caffeine.cache.Cache
import com.zufar.urlshortener.shared.config.RateLimitConfig
import io.github.bucket4j.Bucket
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class RateLimitFilter(
    private val rateLimitConfig: RateLimitConfig,
    private val buckets: Cache<String, Bucket>
) : OncePerRequestFilter() {

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        return request.method == "OPTIONS" ||
            path == "/api/v1/health" ||
            path.startsWith("/api/v1/auth/") ||
            path == "/api/v1/auth" ||
            path.startsWith("/api/v1/swagger-ui") ||
            path.startsWith("/api/v1/api-docs") ||
            path.startsWith("/actuator")
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val clientIp = resolveClientIp(request)
        val bucket = buckets.get(clientIp) { rateLimitConfig.createBucket() }

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response)
        } else {
            response.status = HttpStatus.TOO_MANY_REQUESTS.value()
            response.contentType = MediaType.APPLICATION_JSON_VALUE
            response.setHeader("Retry-After", "60")
            response.writer.write("""{"errorMessage":"Rate limit exceeded. Please try again later."}""")
        }
    }

    private fun resolveClientIp(request: HttpServletRequest): String {
        val forwarded = request.getHeader("X-Forwarded-For")
        return if (!forwarded.isNullOrBlank() && rateLimitConfig.isTrustedProxy(request.remoteAddr)) {
            forwarded.split(",").firstNotNullOfOrNull { it.trim().takeIf(String::isNotEmpty) } ?: request.remoteAddr
        } else {
            request.remoteAddr
        }
    }
}
