package com.zufar.urlshortener.service

import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.MDC
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import java.util.UUID

@Component
@Order(1)
class CorrelationIdFilter : Filter {

    override fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain) {
        val httpResponse = response as HttpServletResponse
        val correlationId = generateCorrelationId()

        MDC.put("correlationId", correlationId)

        httpResponse.setHeader("X-Correlation-ID", correlationId)

        try {
            chain.doFilter(request, response)
        } finally {
            MDC.clear()
        }
    }

    private fun generateCorrelationId(): String {
        return UUID.randomUUID().toString()
    }
}

