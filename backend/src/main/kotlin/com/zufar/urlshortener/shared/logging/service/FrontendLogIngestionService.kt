package com.zufar.urlshortener.shared.logging.service

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import com.fasterxml.jackson.databind.node.TextNode
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.logging.dto.FrontendLogRequest
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant

private const val FRONTEND_LOG_TEMPLATE =
    "frontend_event_ingested clientLevel={} runtime={} sessionId={} browserTimestamp={} clientIp={} message={} context={}"
private const val MAX_CONTEXT_DEPTH = 5
private const val MAX_CONTEXT_JSON_LENGTH = 8000
private const val MAX_CONTEXT_VALUE_LENGTH = 500
private const val MAX_SANITIZED_CONTEXT_ARRAY_ITEMS = 25
private const val TRUNCATED_VALUE = "[TRUNCATED]"
private const val REDACTED_VALUE = "[REDACTED]"
private const val TOO_LARGE_CONTEXT_JSON = """{"truncated":true,"reason":"context_too_large"}"""
private val CONTROL_CHARACTERS = Regex("[\\r\\n\\t]+")
private val SENSITIVE_KEY_PATTERN =
    Regex("authorization|cookie|password|secret|token|api[-_]?key|access[-_]?key|refresh[-_]?token", RegexOption.IGNORE_CASE)

@Service
class FrontendLogIngestionService(
    private val clientIpResolver: ClientIpResolver
) {

    private val frontendLog = LoggerFactory.getLogger("frontend.logs")
    private val objectMapper: ObjectMapper = ObjectMapper()

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
            "debug" -> frontendLog.debug(FRONTEND_LOG_TEMPLATE, *args)
            "info" -> frontendLog.debug(FRONTEND_LOG_TEMPLATE, *args)
            "warn" -> frontendLog.warn(FRONTEND_LOG_TEMPLATE, *args)
            "error" -> frontendLog.warn(FRONTEND_LOG_TEMPLATE, *args)
        }
    }

    private fun parseTimestamp(timestamp: String): Instant =
        runCatching { Instant.parse(timestamp) }
            .getOrElse { throw InvalidRequestException("Timestamp must be a valid ISO-8601 instant") }

    private fun sanitizeContext(context: Map<String, Any?>?): String? {
        if (context == null) {
            return null
        }

        val contextNode: JsonNode = objectMapper.valueToTree(context)

        val serialized = objectMapper.writeValueAsString(sanitizeNode(contextNode, depth = 0))
        return if (serialized.length <= MAX_CONTEXT_JSON_LENGTH) {
            serialized
        } else {
            TOO_LARGE_CONTEXT_JSON
        }
    }

    private fun sanitizeNode(node: JsonNode, depth: Int, key: String? = null): JsonNode {
        if (key != null && SENSITIVE_KEY_PATTERN.containsMatchIn(key)) {
            return TextNode(REDACTED_VALUE)
        }

        if (depth >= MAX_CONTEXT_DEPTH) {
            return TextNode(TRUNCATED_VALUE)
        }

        return when {
            node.isObject -> {
                val objectNode = JsonNodeFactory.instance.objectNode()
                node.fieldNames().forEachRemaining { fieldName ->
                    val fieldValue = node.get(fieldName)
                    objectNode.set<JsonNode>(fieldName, sanitizeNode(fieldValue, depth + 1, fieldName))
                }

                objectNode
            }

            node.isArray -> {
                val arrayNode = JsonNodeFactory.instance.arrayNode()
                node.take(MAX_SANITIZED_CONTEXT_ARRAY_ITEMS).forEach { item ->
                    arrayNode.add(sanitizeNode(item, depth + 1))
                }
                if (node.size() > MAX_SANITIZED_CONTEXT_ARRAY_ITEMS) {
                    arrayNode.add(TRUNCATED_VALUE)
                }
                arrayNode
            }

            node.isTextual -> TextNode(sanitizeText(node.asText(), MAX_CONTEXT_VALUE_LENGTH))
            node.isNumber || node.isBoolean || node.isNull -> node.deepCopy()
            else -> TextNode(sanitizeText(node.toString(), MAX_CONTEXT_VALUE_LENGTH))
        }
    }

    private fun sanitizeText(value: String, maxLength: Int): String =
        CONTROL_CHARACTERS.replace(value, " ").trim().take(maxLength)
}
