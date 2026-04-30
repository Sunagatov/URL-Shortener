package com.zufar.urlshortener.shared.filter

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.Logger
import ch.qos.logback.core.read.ListAppender
import com.zufar.urlshortener.shared.config.RateLimitConfig
import com.zufar.urlshortener.shared.http.ClientIpResolver
import jakarta.servlet.FilterChain
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.slf4j.LoggerFactory
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.web.servlet.HandlerMapping
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class RequestCompletionLoggingFilterTest {

    private val rateLimitConfig = RateLimitConfig(100, "")

    private val filter = RequestCompletionLoggingFilter(
        clientIpResolver = ClientIpResolver(rateLimitConfig),
        slowRequestThresholdMs = 1000
    )

    private val logger = LoggerFactory.getLogger("http.access") as Logger

    @AfterEach
    fun tearDown() {
        logger.detachAndStopAllAppenders()
    }

    @Test
    fun `logs successful request with template path`() {
        val appender = ListAppender<ch.qos.logback.classic.spi.ILoggingEvent>().apply { start() }
        logger.addAppender(appender)
        logger.level = Level.INFO

        val request = MockHttpServletRequest("GET", "/abc12345").apply {
            setAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE, "/{urlHash}")
            remoteAddr = "127.0.0.1"
            userPrincipal = java.security.Principal { "user@example.com" }
        }
        val response = MockHttpServletResponse().apply { status = 302 }

        filter.doFilter(request, response, FilterChain { _, _ -> })

        assertEquals(1, appender.list.size)
        val event = appender.list.single()
        assertEquals(Level.INFO, event.level)
        assertTrue(event.formattedMessage.contains("http.request.completed"))
        assertTrue(event.formattedMessage.contains("path=/{urlHash}"))
    }

    @Test
    fun `logs public internet 404 noise at debug`() {
        val appender = ListAppender<ch.qos.logback.classic.spi.ILoggingEvent>().apply { start() }
        logger.addAppender(appender)
        logger.level = Level.DEBUG

        val request = MockHttpServletRequest("GET", "/wp-login.php").apply {
            remoteAddr = "127.0.0.1"
        }
        val response = MockHttpServletResponse().apply { status = 404 }

        filter.doFilter(request, response, FilterChain { _, _ -> })

        assertEquals(Level.DEBUG, appender.list.single().level)
    }
}
