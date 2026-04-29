package com.zufar.urlshortener.shared.filter

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.zufar.urlshortener.shared.config.RateLimitConfig
import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import jakarta.servlet.FilterChain
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import java.time.Duration

@ExtendWith(MockitoExtension::class)
class RateLimitFilterTest {

    @Mock private lateinit var rateLimitConfig: RateLimitConfig
    @Mock private lateinit var filterChain: FilterChain

    private lateinit var buckets: Cache<String, Bucket>
    private lateinit var filter: RateLimitFilter

    @BeforeEach
    fun setup() {
        buckets = Caffeine.newBuilder().build()
        filter = RateLimitFilter(rateLimitConfig, buckets)
    }

    private fun bucketWithCapacity(capacity: Long): Bucket {
        val limit = Bandwidth.builder()
            .capacity(capacity)
            .refillIntervally(capacity, Duration.ofMinutes(1))
            .build()
        return Bucket.builder().addLimit(limit).build()
    }

    @Test
    fun `when rate limit exceeded returns 429 with JSON content type`() {
        val exhaustedBucket = bucketWithCapacity(1).apply { tryConsume(1) }
        whenever(rateLimitConfig.createBucket()).thenReturn(exhaustedBucket)

        val request = MockHttpServletRequest().apply { remoteAddr = "10.0.0.1" }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        assertEquals(HttpStatus.TOO_MANY_REQUESTS.value(), response.status)
        assertEquals(MediaType.APPLICATION_JSON_VALUE, response.contentType)
        verify(filterChain, never()).doFilter(request, response)
    }

    @Test
    fun `when rate limit exceeded response body contains errorMessage field`() {
        val exhaustedBucket = bucketWithCapacity(1).apply { tryConsume(1) }
        whenever(rateLimitConfig.createBucket()).thenReturn(exhaustedBucket)

        val request = MockHttpServletRequest().apply { remoteAddr = "10.0.0.2" }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        val body = response.contentAsString
        assertTrue(body.contains("errorMessage"), "429 body must contain errorMessage field")
    }

    @Test
    fun `when rate limit exceeded response includes Retry-After header`() {
        val exhaustedBucket = bucketWithCapacity(1).apply { tryConsume(1) }
        whenever(rateLimitConfig.createBucket()).thenReturn(exhaustedBucket)

        val request = MockHttpServletRequest().apply { remoteAddr = "10.0.0.3" }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        assertTrue(response.getHeader("Retry-After") != null, "429 response must include Retry-After header")
    }

    @Test
    fun `when rate limit not exceeded request passes through to filter chain`() {
        whenever(rateLimitConfig.createBucket()).thenReturn(bucketWithCapacity(100))

        val request = MockHttpServletRequest().apply { remoteAddr = "10.0.0.4" }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        verify(filterChain).doFilter(request, response)
    }

    @Test
    fun `X-Forwarded-For header is ignored when remote address is not trusted proxy`() {
        whenever(rateLimitConfig.createBucket()).thenReturn(bucketWithCapacity(100))

        val request = MockHttpServletRequest().apply {
            remoteAddr = "10.0.0.99"
            addHeader("X-Forwarded-For", "203.0.113.5, 10.0.0.1")
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        assertTrue(buckets.getIfPresent("10.0.0.99") != null, "Bucket should be keyed on remote address")
    }

    @Test
    fun `X-Forwarded-For header is used when remote address is trusted proxy`() {
        whenever(rateLimitConfig.createBucket()).thenReturn(bucketWithCapacity(100))
        whenever(rateLimitConfig.isTrustedProxy("10.0.0.99")).thenReturn(true)

        val request = MockHttpServletRequest().apply {
            remoteAddr = "10.0.0.99"
            addHeader("X-Forwarded-For", "203.0.113.5, 10.0.0.1")
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        assertTrue(buckets.getIfPresent("203.0.113.5") != null, "Bucket should be keyed on forwarded IP")
    }

    @Test
    fun `blank forwarded client entries fall back to remote address`() {
        whenever(rateLimitConfig.createBucket()).thenReturn(bucketWithCapacity(100))
        whenever(rateLimitConfig.isTrustedProxy("10.0.0.99")).thenReturn(true)

        val request = MockHttpServletRequest().apply {
            remoteAddr = "10.0.0.99"
            addHeader("X-Forwarded-For", "   ,   ")
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, filterChain)

        assertTrue(buckets.getIfPresent("10.0.0.99") != null, "Bucket should fall back to remote address")
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
        verifyNoInteractions(rateLimitConfig)
    }
}
