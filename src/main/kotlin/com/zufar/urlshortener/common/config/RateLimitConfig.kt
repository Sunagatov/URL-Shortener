package com.zufar.urlshortener.common.config

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Duration

@Configuration
class RateLimitConfig {

    @Value("\${rate.limit.requests:100}")
    private var requestsPerMinute: Long = 100

    @Bean
    fun rateLimitBuckets(): Cache<String, Bucket> = Caffeine.newBuilder()
        .expireAfterAccess(Duration.ofMinutes(10))
        .maximumSize(100_000)
        .build()

    fun createBucket(): Bucket {
        val limit = Bandwidth.builder()
            .capacity(requestsPerMinute)
            .refillIntervally(requestsPerMinute, Duration.ofMinutes(1))
            .build()
        return Bucket.builder()
            .addLimit(limit)
            .build()
    }
}
