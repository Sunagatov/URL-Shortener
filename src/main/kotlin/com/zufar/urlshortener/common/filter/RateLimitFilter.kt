package com.zufar.urlshortener.common.filter

import com.zufar.urlshortener.common.config.RateLimitConfig
import io.github.bucket4j.Bucket
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.concurrent.ConcurrentHashMap

@Component
class RateLimitFilter(
    private val rateLimitConfig: RateLimitConfig,
    private val buckets: ConcurrentHashMap<String, Bucket>
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val clientIp = request.remoteAddr
        val bucket = buckets.computeIfAbsent(clientIp) { rateLimitConfig.createBucket() }

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response)
        } else {
            response.status = HttpStatus.TOO_MANY_REQUESTS.value()
            response.writer.write("{\"error\":\"Rate limit exceeded\"}")
        }
    }
}