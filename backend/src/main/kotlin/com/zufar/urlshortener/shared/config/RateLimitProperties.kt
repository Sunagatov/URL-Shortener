package com.zufar.urlshortener.shared.config

import jakarta.validation.Valid
import jakarta.validation.constraints.Min
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.validation.annotation.Validated

@ConfigurationProperties(prefix = "rate.limit")
@Validated
data class RateLimitProperties(
    val enabled: Boolean = true,
    val trustedProxies: String = "",
    @field:Valid val bucketCache: BucketCacheProperties = BucketCacheProperties(),
    @field:Valid val auth: BucketPolicyProperties = BucketPolicyProperties(capacity = 20, refillTokens = 20, refillMinutes = 1),
    @field:Valid val publicCreate: BucketPolicyProperties = BucketPolicyProperties(capacity = 30, refillTokens = 30, refillMinutes = 1),
    @field:Valid val publicRedirect: BucketPolicyProperties = BucketPolicyProperties(capacity = 240, refillTokens = 240, refillMinutes = 1),
    @field:Valid val frontendLogs: BucketPolicyProperties = BucketPolicyProperties(capacity = 30, refillTokens = 30, refillMinutes = 1),
    @field:Valid val authenticatedApi: BucketPolicyProperties = BucketPolicyProperties(capacity = 120, refillTokens = 120, refillMinutes = 1)
)

data class BucketCacheProperties(
    @field:Min(1) val maxSize: Long = 100_000,
    @field:Min(1) val expireMinutes: Long = 10
)

data class BucketPolicyProperties(
    @field:Min(1) val capacity: Long,
    @field:Min(1) val refillTokens: Long,
    @field:Min(1) val refillMinutes: Long
)
