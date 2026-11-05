package com.zufar.urlshortener.shared.http

import com.zufar.urlshortener.shared.config.RateLimitConfig
import com.zufar.urlshortener.shared.config.RateLimitProperties
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlin.test.assertFalse

class ClientIpResolverTest {
    private fun resolve(header: String, peer: String = "172.18.0.2"): String {
        val config = RateLimitConfig(RateLimitProperties(trustedProxies = "172.18.0.2,172.18.0.3"))
        return ClientIpResolver(config).resolve(MockHttpServletRequest().apply {
            remoteAddr = peer
            addHeader("X-Forwarded-For", header)
        })
    }

    @Test
    fun `attacker prepended addresses are not accepted`() {
        assertEquals("203.0.113.9", resolve("198.51.100.1, 203.0.113.9, 172.18.0.3"))
    }

    @Test
    fun `forwarded headers from untrusted peers are ignored`() {
        assertEquals("203.0.113.9", resolve("198.51.100.1", "203.0.113.9"))
    }

    @Test
    fun `malformed and hostname addresses do not reach DNS enrichment`() {
        for (header in listOf("attacker.example", "unknown", "127.0.0.1:8080", "1.2.3.999", "1.2.3.4,", "01.2.3.4", "1.2.3.4\r\nInjected: x")) {
            assertEquals("172.18.0.2", resolve(header), header)
        }
    }

    @Test
    fun `literal IPv6 visitors remain supported`() {
        assertEquals("2001:db8::5", resolve("2001:db8::5"))
    }

    @Test
    fun `operator configured proxy hostname resolves only its actual addresses`() {
        val config = RateLimitConfig(RateLimitProperties(trustedProxyHosts = "localhost"))
        assertTrue(config.isTrustedProxy("127.0.0.1"))
        assertFalse(config.isTrustedProxy("192.0.2.7"))
    }
}
