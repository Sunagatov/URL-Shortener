package com.zufar.urlshortener.common.config

import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import io.github.bucket4j.Refill
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap

@Configuration
class RateLimitConfig {

    @Value("\${rate.limit.requests:100}")
    private var requestsPerMinute: Long = 100

    @Bean
    fun rateLimitBuckets(): ConcurrentHashMap<String, Bucket> = ConcurrentHashMap()

    fun createBucket(): Bucket {
        val limit = Bandwidth.classic(requestsPerMinute, Refill.intervally(requestsPerMinute, Duration.ofMinutes(1)))
        return Bucket.builder()
            .addLimit(limit)
            .build()
    }
}