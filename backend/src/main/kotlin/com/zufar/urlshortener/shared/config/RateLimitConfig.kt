package com.zufar.urlshortener.shared.config

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.web.util.matcher.IpAddressMatcher
import java.time.Duration

@Configuration
class RateLimitConfig(
    @Value("\${rate.limit.requests:100}") private val requestsPerMinute: Long,
    @Value("\${rate.limit.trusted-proxies:}") trustedProxies: String
) {
    private val trustedProxyMatchers = trustedProxies
        .split(",")
        .map(String::trim)
        .filter(String::isNotEmpty)
        .map(::IpAddressMatcher)

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

    fun isTrustedProxy(remoteAddress: String?): Boolean {
        if (remoteAddress.isNullOrBlank() || trustedProxyMatchers.isEmpty()) {
            return false
        }

        return trustedProxyMatchers.any { it.matches(remoteAddress) }
    }
}
