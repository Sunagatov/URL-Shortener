package com.zufar.urlshortener.shared.logging.service

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.Logger
import ch.qos.logback.core.read.ListAppender
import com.zufar.urlshortener.shared.config.RateLimitConfig
import com.zufar.urlshortener.shared.config.RateLimitProperties
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.logging.dto.FrontendLogRequest
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.slf4j.LoggerFactory
import org.springframework.mock.web.MockHttpServletRequest
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class FrontendLogIngestionServiceTest {

    private val logger = LoggerFactory.getLogger("frontend.logs") as Logger
    private val service = FrontendLogIngestionService(
        clientIpResolver = ClientIpResolver(RateLimitConfig(RateLimitProperties(), SimpleMeterRegistry()))
    )

    @AfterEach
    fun tearDown() {
        logger.detachAndStopAllAppenders()
    }

    @Test
    fun `ingest redacts sensitive context and downgrades client error to warn`() {
        val appender = ListAppender<ch.qos.logback.classic.spi.ILoggingEvent>().apply { start() }
        logger.addAppender(appender)
        logger.level = Level.WARN

        service.ingest(
            FrontendLogRequest(
                level = "error",
                message = "frontend.api.request_failed",
                runtime = "browser",
                sessionId = "session-123",
                timestamp = "2026-04-30T13:00:00Z",
                context = mapOf(
                    "accessToken" to "secret-token",
                    "nested" to mapOf(
                        "password" to "super-secret",
                        "safe" to "kept"
                    )
                )
            ),
            MockHttpServletRequest("POST", "/api/v1/frontend/logs").apply {
                remoteAddr = "127.0.0.1"
            }
        )

        val event = appender.list.single()
        assertEquals(Level.WARN, event.level)
        assertTrue(event.formattedMessage.contains("frontend_event_ingested"))
        assertTrue(event.formattedMessage.contains("clientLevel=error"))
        assertTrue(event.formattedMessage.contains("sessionId=session-123"))
        assertTrue(event.formattedMessage.contains("\"accessToken\":\"[REDACTED]\""))
        assertTrue(event.formattedMessage.contains("\"password\":\"[REDACTED]\""))
        assertTrue(event.formattedMessage.contains("\"safe\":\"kept\""))
    }
}
