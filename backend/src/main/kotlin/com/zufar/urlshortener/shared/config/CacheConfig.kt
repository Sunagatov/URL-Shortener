package com.zufar.urlshortener.shared.config

import com.github.benmanes.caffeine.cache.Caffeine
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.caffeine.CaffeineCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Duration

@Configuration
@EnableCaching
class CacheConfig(
    @Value($$"${cache.max.size:10000}") private val maxSize: Long,
    @Value($$"${cache.expire.minutes:30}") private val expireMinutes: Long,
    @Value($$"${cache.names:}") private val cacheNames: String
) {

    @Bean
    fun cacheManager(): CacheManager {
        val cacheManager = CaffeineCacheManager()
        cacheManager.setCaffeine(
            Caffeine.newBuilder()
                .maximumSize(maxSize)
                .expireAfterWrite(Duration.ofMinutes(expireMinutes))
                .recordStats()
        )
        val configuredCacheNames = cacheNames.split(",")
            .map(String::trim)
            .filter(String::isNotEmpty)
        if (configuredCacheNames.isNotEmpty()) {
            cacheManager.setCacheNames(configuredCacheNames)
        }
        return cacheManager
    }
}
