package com.zufar.urlshortener.shared.filter

import com.github.benmanes.caffeine.cache.Cache
import com.zufar.urlshortener.shared.ACTUATOR_PATH_PREFIX
import com.zufar.urlshortener.shared.API_DOCS_PATH_PREFIX
import com.zufar.urlshortener.shared.DOCS_PATH_PREFIX
import com.zufar.urlshortener.shared.http.ErrorResponseWriter
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.config.RateLimitConfig
import io.github.bucket4j.Bucket
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

private const val RETRY_AFTER_HEADER = "Retry-After"
private const val RATE_LIMIT_RETRY_AFTER_SECONDS = "60"
private const val RATE_LIMIT_ERROR_MESSAGE = "Rate limit exceeded. Please try again later."

@Component
class RateLimitFilter(
    private val rateLimitConfig: RateLimitConfig,
    private val buckets: Cache<String, Bucket>,
    private val errorResponseWriter: ErrorResponseWriter,
    private val clientIpResolver: ClientIpResolver
) : OncePerRequestFilter() {

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        return request.method == "OPTIONS" ||
            path == "/api/v1/health" ||
            path.startsWith("/api/v1/auth/") ||
            path == "/api/v1/auth" ||
            path.startsWith(DOCS_PATH_PREFIX) ||
            path.startsWith(API_DOCS_PATH_PREFIX) ||
            path.startsWith(ACTUATOR_PATH_PREFIX)
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val clientIp = clientIpResolver.resolve(request)
        val bucket = buckets.get(clientIp) { rateLimitConfig.createBucket() }

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response)
        } else {
            writeRateLimitExceededResponse(response)
        }
    }

    private fun writeRateLimitExceededResponse(response: HttpServletResponse) {
        response.setHeader(RETRY_AFTER_HEADER, RATE_LIMIT_RETRY_AFTER_SECONDS)
        errorResponseWriter.write(response, HttpStatus.TOO_MANY_REQUESTS, RATE_LIMIT_ERROR_MESSAGE)
    }
}
