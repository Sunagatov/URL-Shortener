package com.zufar.urlshortener.shared.config

import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class CorsConfigTest {

    private fun request(path: String) = MockHttpServletRequest("GET", path).apply {
        servletPath = path
        requestURI = path
    }

    @Test
    fun `corsConfigurationSource registers allowed origins`() {
        val config = CorsConfig("http://localhost:3000", "http://localhost:*")
        val corsConfig = config.corsConfigurationSource().getCorsConfiguration(request("/api/v1/urls"))!!

        assertTrue(corsConfig.allowedOrigins!!.contains("http://localhost:3000"))
    }

    @Test
    fun `corsConfigurationSource allows standard HTTP methods`() {
        val config = CorsConfig("http://localhost:3000", "")
        val corsConfig = config.corsConfigurationSource().getCorsConfiguration(request("/api/v1/urls"))!!

        assertTrue(corsConfig.allowedMethods!!.containsAll(listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")))
    }

    @Test
    fun `corsConfigurationSource allows credentials`() {
        val config = CorsConfig("http://localhost:3000", "")
        val corsConfig = config.corsConfigurationSource().getCorsConfiguration(request("/api/v1/urls"))!!

        assertTrue(corsConfig.allowCredentials == true)
    }

    @Test
    fun `corsConfigurationSource exposes Authorization and Content-Type headers`() {
        val config = CorsConfig("http://localhost:3000", "")
        val corsConfig = config.corsConfigurationSource().getCorsConfiguration(request("/api/v1/urls"))!!

        assertTrue(corsConfig.exposedHeaders!!.contains("Authorization"))
        assertTrue(corsConfig.exposedHeaders!!.contains("Content-Type"))
    }

    @Test
    fun `corsConfigurationSource parses multiple comma-separated origins`() {
        val config = CorsConfig("http://localhost:3000,https://example.com", "")
        val corsConfig = config.corsConfigurationSource().getCorsConfiguration(request("/api/v1/urls"))!!

        assertEquals(2, corsConfig.allowedOrigins!!.size)
        assertTrue(corsConfig.allowedOrigins!!.contains("https://example.com"))
    }

    @Test
    fun `corsConfigurationSource applies to all paths`() {
        val config = CorsConfig("http://localhost:3000", "")
        val source = config.corsConfigurationSource()

        assertTrue(source.getCorsConfiguration(request("/api/v1/urls")) != null)
        assertTrue(source.getCorsConfiguration(request("/abc12345")) != null)
    }

    @Test
    fun `corsConfigurationSource sets maxAge to 1 hour`() {
        val config = CorsConfig("http://localhost:3000", "")
        val corsConfig = config.corsConfigurationSource().getCorsConfiguration(request("/"))!!

        assertEquals(3600, corsConfig.maxAge)
    }
}
