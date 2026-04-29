package com.zufar.urlshortener.health.controller

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class HealthControllerTest {

    @Test
    fun `health returns typed up status response`() {
        val beforeCall = System.currentTimeMillis()

        val response = HealthController().health()

        val body = response.body
        requireNotNull(body)
        assertEquals("UP", body.status)
        assertTrue(body.timestamp >= beforeCall)
    }
}
