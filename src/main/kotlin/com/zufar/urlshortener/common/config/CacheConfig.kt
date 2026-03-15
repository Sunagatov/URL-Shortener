package com.zufar.urlshortener.common.config

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
class CacheConfig {

    @Value("\${cache.max.size:10000}")
    private var maxSize: Long = 10000

    @Value("\${cache.expire.minutes:30}")
    private var expireMinutes: Long = 30

    @Value("\${cache.names:urlMappings,userDetails}")
    private lateinit var cacheNames: String

    @Bean
    fun cacheManager(): CacheManager {
        val cacheManager = CaffeineCacheManager()
        cacheManager.setCaffeine(
            Caffeine.newBuilder()
                .maximumSize(maxSize)
                .expireAfterWrite(Duration.ofMinutes(expireMinutes))
                .recordStats()
        )
        cacheManager.setCacheNames(cacheNames.split(",").map { it.trim() })
        return cacheManager
    }
}