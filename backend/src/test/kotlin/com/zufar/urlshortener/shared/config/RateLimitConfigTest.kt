package com.zufar.urlshortener.shared.config

import org.junit.jupiter.api.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class RateLimitConfigTest {

    @Test
    fun `isTrustedProxy matches exact addresses and CIDR ranges`() {
        val config = RateLimitConfig(
            RateLimitProperties(trustedProxies = "10.0.0.5, 192.168.0.0/16")
        )

        assertTrue(config.isTrustedProxy("10.0.0.5"))
        assertTrue(config.isTrustedProxy("192.168.1.10"))
        assertFalse(config.isTrustedProxy("203.0.113.5"))
    }

    @Test
    fun `isTrustedProxy returns false when trusted proxy list is blank`() {
        val config = RateLimitConfig(RateLimitProperties(trustedProxies = ""))

        assertFalse(config.isTrustedProxy("10.0.0.5"))
    }
}
