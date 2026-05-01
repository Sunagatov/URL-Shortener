package com.zufar.urlshortener.shared.filter

import org.junit.jupiter.api.Test
import org.slf4j.MDC
import org.springframework.mock.web.MockFilterChain
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class CorrelationIdFilterTest {

    private val filter = CorrelationIdFilter()

    @Test
    fun `generates correlation and request identifiers and clears MDC afterwards`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, MockFilterChain())

        assertNotNull(response.getHeader("X-Correlation-ID"))
        assertNotNull(response.getHeader("X-Request-ID"))
        assertNull(MDC.get("correlationId"))
        assertNull(MDC.get("requestId"))
    }

    @Test
    fun `reuses sanitized incoming correlation id and propagates sanitized trace id`() {
        val request = MockHttpServletRequest().apply {
            addHeader("X-Correlation-ID", "abc-123\nbad")
            addHeader("X-Trace-ID", "trace-1\rline")
        }
        val response = MockHttpServletResponse()

        filter.doFilter(request, response, MockFilterChain())

        assertEquals("abc-123_bad", response.getHeader("X-Correlation-ID"))
        assertEquals("trace-1_line", response.getHeader("X-Trace-ID"))
        assertEquals(true, response.getHeader("X-Request-ID")?.isNotBlank())
    }
}
