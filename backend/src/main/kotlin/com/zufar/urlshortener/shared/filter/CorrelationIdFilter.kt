package com.zufar.urlshortener.shared.filter

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.MDC
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID
import java.util.regex.Pattern

@Component
@Order(1)
class CorrelationIdFilter : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val correlationId = request.getHeader(CORRELATION_ID_HEADER)
            ?.let(::sanitizeHeader)
            ?.takeIf(String::isNotBlank)
            ?: generateCorrelationId()
        val requestId = UUID.randomUUID().toString()
        val clientTraceId = request.getHeader(CLIENT_TRACE_ID_HEADER)
            ?.let(::sanitizeHeader)
            ?.takeIf(String::isNotBlank)

        MDC.put("correlationId", correlationId)
        MDC.put("requestId", requestId)
        response.setHeader(CORRELATION_ID_HEADER, correlationId)
        response.setHeader(REQUEST_ID_HEADER, requestId)
        if (clientTraceId != null) {
            MDC.put("clientTraceId", clientTraceId)
            response.setHeader(CLIENT_TRACE_ID_HEADER, clientTraceId)
        }

        try {
            filterChain.doFilter(request, response)
        } finally {
            MDC.remove("correlationId")
            MDC.remove("requestId")
            MDC.remove("clientTraceId")
        }
    }

    private fun generateCorrelationId(): String =
        UUID.randomUUID().toString().replace("-", "").take(MAX_HEADER_LENGTH)

    private fun sanitizeHeader(value: String): String {
        val cleaned = UNSAFE_HEADER_CHARS.matcher(value).replaceAll("_")
        return cleaned.take(MAX_HEADER_LENGTH)
    }
}

private const val CORRELATION_ID_HEADER = "X-Correlation-ID"
private const val REQUEST_ID_HEADER = "X-Request-ID"
private const val CLIENT_TRACE_ID_HEADER = "X-Trace-ID"
private const val MAX_HEADER_LENGTH = 64
private val UNSAFE_HEADER_CHARS: Pattern = Pattern.compile("[^A-Za-z0-9._\\-]")
