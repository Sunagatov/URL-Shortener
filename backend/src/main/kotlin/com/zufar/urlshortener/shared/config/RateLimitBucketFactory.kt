package com.zufar.urlshortener.shared.config

import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import org.springframework.stereotype.Component

@Component
class RateLimitBucketFactory {

    fun create(policy: RateLimitPolicy): Bucket {
        val limit = Bandwidth.builder()
            .capacity(policy.capacity)
            .refillIntervally(policy.refillTokens, policy.refillPeriod)
            .build()
        return Bucket.builder()
            .addLimit(limit)
            .build()
    }
}
