package com.zufar.urlshortener.shared.filter

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.zufar.urlshortener.shared.AUTHENTICATED_USER_ID_ATTRIBUTE
import com.zufar.urlshortener.shared.config.BucketPolicyProperties
import com.zufar.urlshortener.shared.config.RateLimitConfig
import com.zufar.urlshortener.shared.config.RateLimitProperties
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.http.ErrorResponseWriter
import io.github.bucket4j.Bucket
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import jakarta.servlet.FilterChain
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.times
import tools.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse

@ExtendWith(MockitoExtension::class)
class RateLimitFilterTest {

    @Mock private lateinit var filterChain: FilterChain

    private lateinit var buckets: Cache<String, Bucket>
    private lateinit var filter: RateLimitFilter
    private lateinit var rateLimitConfig: RateLimitConfig

    @BeforeEach
    fun setup() {
        buckets = Caffeine.newBuilder().build()
        rateLimitConfig = createRateLimitConfig()
        filter = createFilter(rateLimitConfig)
    }

    @Test
    fun `when rate limit exceeded returns 429 with JSON content type`() {
        val request = MockHttpServletRequest("GET", "/abc12345").apply {
            requestURI = "/abc12345"
            servletPath = "/abc12345"
            remoteAddr = "10.0.0.1"
            setAttribute("requestId", "request-123")
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)
        filter.doFilter(request, response, filterChain)

        assertEquals(HttpStatus.TOO_MANY_REQUESTS.value(), response.status)
        assertEquals(MediaType.APPLICATION_JSON_VALUE, response.contentType)
        verify(filterChain, times(1)).doFilter(request, response)
    }

    @Test
    fun `when rate limit exceeded response body contains structured fields`() {
        val request = MockHttpServletRequest("GET", "/abc12345").apply {
            requestURI = "/abc12345"
            servletPath = "/abc12345"
            remoteAddr = "10.0.0.2"
            setAttribute("requestId", "request-456")
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)
        filter.doFilter(request, response, filterChain)

        val body = response.contentAsString
        assertTrue(body.contains("errorMessage"))
        assertTrue(body.contains("RATE_LIMIT_EXCEEDED"))
        assertTrue(body.contains("retryAfterSeconds"))
        assertTrue(body.contains("request-456"))
    }

    @Test
    fun `when rate limit exceeded response includes dynamic rate limit headers`() {
        val request = MockHttpServletRequest("GET", "/abc12345").apply {
            requestURI = "/abc12345"
            servletPath = "/abc12345"
            remoteAddr = "10.0.0.3"
            setAttribute("requestId", "request-789")
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)
        filter.doFilter(request, response, filterChain)

        assertEquals("1", response.getHeader("X-RateLimit-Limit"))
        assertEquals("0", response.getHeader("X-RateLimit-Remaining"))
        assertTrue(response.getHeader("Retry-After") != null)
        assertTrue(response.getHeader("X-RateLimit-Reset") != null)
    }

    @Test
    fun `when rate limit not exceeded request passes through to filter chain`() {
        val request = MockHttpServletRequest("GET", "/abc12345").apply {
            requestURI = "/abc12345"
            servletPath = "/abc12345"
            remoteAddr = "10.0.0.4"
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        verify(filterChain).doFilter(request, response)
    }

    @Test
    fun `X-Forwarded-For header is ignored when remote address is not trusted proxy`() {
        val request = MockHttpServletRequest("GET", "/abc12345").apply {
            requestURI = "/abc12345"
            servletPath = "/abc12345"
            remoteAddr = "10.0.0.99"
            addHeader("X-Forwarded-For", "203.0.113.5, 10.0.0.1")
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        assertTrue(buckets.getIfPresent("public_redirect:ip:10.0.0.99") != null)
    }

    @Test
    fun `X-Forwarded-For header is used when remote address is trusted proxy`() {
        rateLimitConfig = createRateLimitConfig(trustedProxies = "10.0.0.99")
        filter = createFilter(rateLimitConfig)
        val request = MockHttpServletRequest("GET", "/abc12345").apply {
            requestURI = "/abc12345"
            servletPath = "/abc12345"
            remoteAddr = "10.0.0.99"
            addHeader("X-Forwarded-For", "203.0.113.5, 10.0.0.1")
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        assertTrue(buckets.getIfPresent("public_redirect:ip:203.0.113.5") != null)
    }

    @Test
    fun `authenticated api policy keys on authenticated user id`() {
        val request = MockHttpServletRequest("GET", "/api/v1/users").apply {
            requestURI = "/api/v1/users"
            servletPath = "/api/v1/users"
            remoteAddr = "10.0.0.50"
            setAttribute(AUTHENTICATED_USER_ID_ATTRIBUTE, "user-123")
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        assertTrue(buckets.getIfPresent("authenticated_api:user:user-123") != null)
    }

    @Test
    fun `health endpoint bypasses rate limiting`() {
        val request = MockHttpServletRequest().apply {
            method = "GET"
            servletPath = "/api/v1/health"
            requestURI = "/api/v1/health"
            remoteAddr = "10.0.0.5"
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        verify(filterChain).doFilter(request, response)
    }

    private fun createFilter(config: RateLimitConfig): RateLimitFilter = RateLimitFilter(
        config,
        buckets,
        ErrorResponseWriter(ObjectMapper()),
        ClientIpResolver(config),
        SimpleMeterRegistry()
    )

    private fun createRateLimitConfig(trustedProxies: String = ""): RateLimitConfig =
        RateLimitConfig(
            RateLimitProperties(
                trustedProxies = trustedProxies,
                publicRedirect = BucketPolicyProperties(capacity = 1, refillTokens = 1, refillMinutes = 1)
            ),
            SimpleMeterRegistry()
        )
}
