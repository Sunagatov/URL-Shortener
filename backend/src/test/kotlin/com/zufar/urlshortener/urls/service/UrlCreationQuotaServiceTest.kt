package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.urls.config.UrlProtectionProperties
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import java.time.Instant
import kotlin.test.assertEquals

class UrlCreationQuotaServiceTest {
    private val now = Instant.parse("2026-11-05T12:00:00Z")
    private val store: MongoUrlQuotaStore = mock()
    private val registry = io.micrometer.core.instrument.simple.SimpleMeterRegistry()
    private val service = UrlCreationQuotaService(store, UrlProtectionProperties(), registry)

    @Test
    fun `creation reserves creator global and destination allowances`() {
        whenever(store.tryReserve(any(), any(), any())).thenReturn(true)
        service.reserveCreation("user:one", "one", "example.com", now)
        val keys = argumentCaptor<String>()
        verify(store, times(3)).tryReserve(keys.capture(), any(), eq(now))
        assertEquals(listOf("creator", "global", "host"), keys.allValues.map { it.substringBefore(':') })
    }

    @Test
    fun `global allowance prevents rotating users and destinations`() {
        whenever(store.tryReserve(any(), any(), any())).thenReturn(true)
        whenever(store.tryReserve(eq("global"), any(), any())).thenReturn(false)
        val ex = assertThrows<ApplicationException> { service.reserveCreation("user:new", "new", "other.example", now) }
        assertEquals("URL_GLOBAL_QUOTA_EXCEEDED", ex.code)
        assertEquals(1.0, registry.get("url.quota.decisions").tags("scope", "global", "outcome", "blocked").counter().count())
        kotlin.test.assertFalse(registry.meters.flatMap { it.id.tags }.any { it.value.contains("user:") || it.value.contains("example") })
    }

    @Test
    fun `destination changes consume global and destination allowances`() {
        whenever(store.tryReserve(any(), any(), any())).thenReturn(true)
        service.reserveDestination("example.com", now)
        verify(store).tryReserve("global", 2000, now)
        verify(store, times(2)).tryReserve(any(), any(), any())
    }
}
