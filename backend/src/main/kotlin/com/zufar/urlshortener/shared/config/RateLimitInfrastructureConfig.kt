package com.zufar.urlshortener.shared.config

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.zufar.urlshortener.shared.filter.RateLimitFilter
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.http.ErrorResponseWriter
import io.github.bucket4j.Bucket
import io.micrometer.core.instrument.Gauge
import io.micrometer.core.instrument.MeterRegistry
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Duration

@Configuration
class RateLimitInfrastructureConfig {

    @Bean
    fun rateLimitBuckets(
        rateLimitProperties: RateLimitProperties,
        meterRegistry: MeterRegistry
    ): Cache<String, Bucket> {
        val cache = Caffeine.newBuilder()
            .expireAfterAccess(Duration.ofMinutes(rateLimitProperties.bucketCache.expireMinutes))
            .maximumSize(rateLimitProperties.bucketCache.maxSize)
            .build<String, Bucket>()

        Gauge.builder("rate_limit_bucket_cache_size") { cache.estimatedSize().toDouble() }
            .description("Estimated number of active rate limit buckets")
            .register(meterRegistry)

        return cache
    }

    @Bean
    fun rateLimitFilter(
        rateLimitConfig: RateLimitConfig,
        rateLimitBucketFactory: RateLimitBucketFactory,
        buckets: Cache<String, Bucket>,
        errorResponseWriter: ErrorResponseWriter,
        clientIpResolver: ClientIpResolver,
        meterRegistry: MeterRegistry
    ): RateLimitFilter = RateLimitFilter(
        rateLimitConfig = rateLimitConfig,
        rateLimitBucketFactory = rateLimitBucketFactory,
        buckets = buckets,
        errorResponseWriter = errorResponseWriter,
        clientIpResolver = clientIpResolver,
        meterRegistry = meterRegistry
    )
}
