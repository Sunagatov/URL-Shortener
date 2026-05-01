package com.zufar.urlshortener.frontendlogs.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.zufar.urlshortener.frontendlogs.dto.FrontendLogRequest
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.http.ClientIpResolver
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant

private const val FRONTEND_LOG_TEMPLATE =
    "frontend_event_ingested clientLevel={} runtime={} sessionId={} browserTimestamp={} clientIp={} message={} context={}"
private const val MAX_CONTEXT_JSON_LENGTH = 8000
private const val REDACTED_VALUE = "[REDACTED]"
private const val TOO_LARGE_CONTEXT_JSON = """{"truncated":true,"reason":"context_too_large"}"""
private val CONTROL_CHARACTERS = Regex("[\\r\\n\\t]+")
private val SENSITIVE_JSON_FIELD_PATTERN = Regex(
    """"[^"]*(?:authorization|cookie|password|secret|token|api[-_]?key|access[-_]?key|refresh[-_]?token)[^"]*"\s*:\s*"((?:\\.|[^"\\])*)"""",
    RegexOption.IGNORE_CASE
)
private const val INVALID_FRONTEND_LOG_REQUEST_CODE = "INVALID_FRONTEND_LOG_REQUEST"

@Service
class FrontendLogIngestionService(
    private val clientIpResolver: ClientIpResolver
) {

    private val frontendLog = LoggerFactory.getLogger("frontend.logs")
    private val objectMapper = ObjectMapper()

    fun ingest(request: FrontendLogRequest, httpRequest: HttpServletRequest) {
        val browserTimestamp = parseTimestamp(request.timestamp)
        val clientIp = clientIpResolver.resolve(httpRequest)
        val message = sanitizeText(request.message, 160)
        val sessionId = sanitizeText(request.sessionId, 120)
        val context = sanitizeContext(request.context)
        val args = arrayOf(
            request.level,
            request.runtime,
            sessionId,
            browserTimestamp.toString(),
            clientIp,
            message,
            context ?: "-"
        )

        when (request.level) {
            "debug", "info" -> frontendLog.debug(FRONTEND_LOG_TEMPLATE, *args)
            "warn", "error" -> frontendLog.warn(FRONTEND_LOG_TEMPLATE, *args)
        }
    }

    private fun parseTimestamp(timestamp: String): Instant =
        runCatching { Instant.parse(timestamp) }
            .getOrElse {
                throw ApplicationException.badRequest(
                    INVALID_FRONTEND_LOG_REQUEST_CODE,
                    "Timestamp must be a valid ISO-8601 instant"
                )
            }

    private fun sanitizeContext(context: Map<String, Any?>?): String? {
        if (context == null) {
            return null
        }

        val serialized = objectMapper.writeValueAsString(context)
        if (serialized.length > MAX_CONTEXT_JSON_LENGTH) {
            return TOO_LARGE_CONTEXT_JSON
        }

        return SENSITIVE_JSON_FIELD_PATTERN.replace(serialized) { match ->
            match.value.replace(match.groupValues[1], REDACTED_VALUE)
        }
    }

    private fun sanitizeText(value: String, maxLength: Int): String =
        CONTROL_CHARACTERS.replace(value, " ").trim().take(maxLength)
}
