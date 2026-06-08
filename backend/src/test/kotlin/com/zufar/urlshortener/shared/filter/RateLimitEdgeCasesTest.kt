package com.zufar.urlshortener.shared.filter

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.zufar.urlshortener.shared.AUTHENTICATED_USER_ID_ATTRIBUTE
import com.zufar.urlshortener.shared.config.BucketPolicyProperties
import com.zufar.urlshortener.shared.config.RateLimitBucketFactory
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
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import tools.jackson.databind.ObjectMapper

@ExtendWith(MockitoExtension::class)
class RateLimitEdgeCasesTest {

    @Mock private lateinit var filterChain: FilterChain

    private lateinit var buckets: Cache<String, Bucket>
    private lateinit var meterRegistry: SimpleMeterRegistry

    @BeforeEach
    fun setup() {
        buckets = Caffeine.newBuilder().build()
        meterRegistry = SimpleMeterRegistry()
    }

    @Test
    fun `rate limit disabled skips filtering entirely`() {
        val filter = createFilter(createConfig(enabled = false))
        val request = redirectRequest("10.0.0.1")
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        verify(filterChain).doFilter(request, response)
        assertEquals(200, response.status)
    }

    @Test
    fun `auth endpoint uses auth policy`() {
        val filter = createFilter(createConfig(authCapacity = 1))
        val request = MockHttpServletRequest("POST", "/api/v1/auth/signin").apply {
            requestURI = "/api/v1/auth/signin"
            servletPath = "/api/v1/auth/signin"
            remoteAddr = "10.0.0.1"
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)
        filter.doFilter(request, response, filterChain)

        assertEquals(429, response.status)
        assertTrue(buckets.getIfPresent("auth:ip:10.0.0.1") != null)
    }

    @Test
    fun `POST urls endpoint uses public_create policy for anonymous IP`() {
        val filter = createFilter(createConfig(publicCreateCapacity = 1))
        val request = MockHttpServletRequest("POST", "/api/v1/urls").apply {
            requestURI = "/api/v1/urls"
            servletPath = "/api/v1/urls"
            remoteAddr = "10.0.0.2"
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)
        filter.doFilter(request, response, filterChain)

        assertEquals(429, response.status)
        assertTrue(buckets.getIfPresent("public_create:ip:10.0.0.2") != null)
    }

    @Test
    fun `POST urls endpoint keys public_create policy on authenticated user when present`() {
        val filter = createFilter(createConfig(publicCreateCapacity = 1))
        val request = MockHttpServletRequest("POST", "/api/v1/urls").apply {
            requestURI = "/api/v1/urls"
            servletPath = "/api/v1/urls"
            remoteAddr = "10.0.0.2"
            setAttribute(AUTHENTICATED_USER_ID_ATTRIBUTE, "user-123")
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        assertEquals(200, response.status)
        assertTrue(buckets.getIfPresent("public_create:user:user-123") != null)
    }

    @Test
    fun `frontend logs endpoint uses frontend_logs policy`() {
        val filter = createFilter(createConfig(frontendLogsCapacity = 1))
        val request = MockHttpServletRequest("POST", "/api/v1/frontend/logs").apply {
            requestURI = "/api/v1/frontend/logs"
            servletPath = "/api/v1/frontend/logs"
            remoteAddr = "10.0.0.3"
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)
        filter.doFilter(request, response, filterChain)

        assertEquals(429, response.status)
        assertTrue(buckets.getIfPresent("frontend_logs:ip:10.0.0.3") != null)
    }

    @Test
    fun `exact boundary - Nth request allowed, N+1th blocked`() {
        val filter = createFilter(createConfig(redirectCapacity = 3))
        val response = MockHttpServletResponse()

        repeat(3) {
            filter.doFilter(redirectRequest("10.0.0.10"), MockHttpServletResponse(), filterChain)
        }
        filter.doFilter(redirectRequest("10.0.0.10"), response, filterChain)

        assertEquals(429, response.status)
    }

    @Test
    fun `OPTIONS request bypasses rate limiting`() {
        val filter = createFilter(createConfig(redirectCapacity = 1))
        val request = MockHttpServletRequest("OPTIONS", "/abc12345").apply {
            requestURI = "/abc12345"
            servletPath = "/abc12345"
            remoteAddr = "10.0.0.20"
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        verify(filterChain).doFilter(request, response)
    }

    @Test
    fun `docs endpoint bypasses rate limiting`() {
        val filter = createFilter(createConfig(redirectCapacity = 1))
        val request = MockHttpServletRequest("GET", "/docs/index.html").apply {
            requestURI = "/docs/index.html"
            servletPath = "/docs/index.html"
            remoteAddr = "10.0.0.21"
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        verify(filterChain).doFilter(request, response)
    }

    @Test
    fun `authenticated_api falls back to IP when no userId`() {
        val filter = createFilter(createConfig(authenticatedApiCapacity = 1))
        val request = MockHttpServletRequest("GET", "/api/v1/users").apply {
            requestURI = "/api/v1/users"
            servletPath = "/api/v1/users"
            remoteAddr = "10.0.0.30"
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        assertTrue(buckets.getIfPresent("authenticated_api:ip:10.0.0.30") != null)
    }

    @Test
    fun `different IPs have independent rate limit buckets`() {
        val filter = createFilter(createConfig(redirectCapacity = 1))

        filter.doFilter(redirectRequest("10.0.0.40"), MockHttpServletResponse(), filterChain)
        val response2 = MockHttpServletResponse()
        filter.doFilter(redirectRequest("10.0.0.41"), response2, filterChain)

        // Second IP should still be allowed (independent bucket)
        assertEquals(200, response2.status)
    }

    private fun redirectRequest(ip: String) = MockHttpServletRequest("GET", "/abc12345").apply {
        requestURI = "/abc12345"
        servletPath = "/abc12345"
        remoteAddr = ip
    }

    private fun createFilter(config: RateLimitConfig) = RateLimitFilter(
        config, RateLimitBucketFactory(), buckets,
        ErrorResponseWriter(ObjectMapper()), ClientIpResolver(config), meterRegistry
    )

    private fun createConfig(
        enabled: Boolean = true,
        redirectCapacity: Long = 240,
        authCapacity: Long = 20,
        publicCreateCapacity: Long = 30,
        frontendLogsCapacity: Long = 30,
        authenticatedApiCapacity: Long = 120
    ) = RateLimitConfig(
        RateLimitProperties(
            enabled = enabled,
            publicRedirect = BucketPolicyProperties(capacity = redirectCapacity, refillTokens = redirectCapacity, refillMinutes = 1),
            auth = BucketPolicyProperties(capacity = authCapacity, refillTokens = authCapacity, refillMinutes = 1),
            publicCreate = BucketPolicyProperties(capacity = publicCreateCapacity, refillTokens = publicCreateCapacity, refillMinutes = 1),
            frontendLogs = BucketPolicyProperties(capacity = frontendLogsCapacity, refillTokens = frontendLogsCapacity, refillMinutes = 1),
            authenticatedApi = BucketPolicyProperties(capacity = authenticatedApiCapacity, refillTokens = authenticatedApiCapacity, refillMinutes = 1)
        )
    )
}
