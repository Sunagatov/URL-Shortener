package com.zufar.urlshortener.shared.web

import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class ApplicationRoutesTest {
    private fun request(path: String, query: String? = null, method: String = "GET") =
        MockHttpServletRequest(method, path).apply {
            servletPath = path
            queryString = query
        }

    @Test
    fun `public redirects allow continuation and QR query parameters`() {
        for (query in listOf(null, "continue=1", "qr=true", "continue=1&qr=1")) {
            val request = request("/abc12345", query)
            assertTrue(ApplicationRoutes.securityPermitAllMatchers().any { it.matches(request) })
            assertEquals(RateLimitedRoute.PUBLIC_REDIRECT, ApplicationRoutes.resolveRateLimitedRoute(request))
        }
    }

    @Test
    fun `redirect matcher does not allow protected API paths or non GET requests`() {
        for (request in listOf(request("/api/v1/urls", "continue=1"), request("/abc12345", "continue=1", "POST"))) {
            assertFalse(ApplicationRoutes.securityPermitAllMatchers().any { it.matches(request) })
        }
    }
}
