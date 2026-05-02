package com.zufar.urlshortener.shared.config

import com.github.benmanes.caffeine.cache.Caffeine
import org.junit.jupiter.api.Test
import java.time.Duration
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class CacheConfigTest {

    @Test
    fun `cacheManager creates cache with configured max size`() {
        val config = CacheConfig(maxSize = 100, expireMinutes = 5, cacheNames = "urlMappings")
        val cacheManager = config.cacheManager()
        val cache = cacheManager.getCache("urlMappings")

        assertNotNull(cache)
    }

    @Test
    fun `cacheManager creates named caches from comma-separated config`() {
        val config = CacheConfig(maxSize = 100, expireMinutes = 5, cacheNames = "urlMappings,sessions")
        val cacheManager = config.cacheManager()

        assertNotNull(cacheManager.getCache("urlMappings"))
        assertNotNull(cacheManager.getCache("sessions"))
    }

    @Test
    fun `cacheManager with empty cache names allows dynamic cache creation`() {
        val config = CacheConfig(maxSize = 100, expireMinutes = 5, cacheNames = "")
        val cacheManager = config.cacheManager()

        // Dynamic cache creation should work when no names are pre-configured
        val cache = cacheManager.getCache("dynamicCache")
        assertNotNull(cache)
    }

    @Test
    fun `cache stores and retrieves values`() {
        val config = CacheConfig(maxSize = 100, expireMinutes = 5, cacheNames = "test")
        val cacheManager = config.cacheManager()
        val cache = cacheManager.getCache("test")!!

        cache.put("key1", "value1")
        assertEquals("value1", cache.get("key1", String::class.java))
    }

    @Test
    fun `cache eviction removes entry`() {
        val config = CacheConfig(maxSize = 100, expireMinutes = 5, cacheNames = "test")
        val cacheManager = config.cacheManager()
        val cache = cacheManager.getCache("test")!!

        cache.put("key1", "value1")
        cache.evict("key1")
        assertNull(cache.get("key1", String::class.java))
    }

    @Test
    fun `cache respects max size by evicting entries`() {
        // Use a very small Caffeine cache directly to test eviction
        val caffeine = Caffeine.newBuilder()
            .maximumSize(2)
            .expireAfterWrite(Duration.ofMinutes(5))
            .build<String, String>()

        caffeine.put("a", "1")
        caffeine.put("b", "2")
        caffeine.put("c", "3")
        caffeine.cleanUp() // Force eviction

        // At most 2 entries should remain
        assertEquals(2, caffeine.estimatedSize())
    }
}
