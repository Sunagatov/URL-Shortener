package com.zufar.urlshortener.shared.config

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import io.micrometer.core.instrument.Gauge
import io.micrometer.core.instrument.MeterRegistry
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.security.web.util.matcher.IpAddressMatcher
import java.time.Duration

@Configuration
@EnableConfigurationProperties(RateLimitProperties::class)
class RateLimitConfig(
    private val rateLimitProperties: RateLimitProperties,
    private val meterRegistry: MeterRegistry
) {
    private val trustedProxyMatchers = rateLimitProperties.trustedProxies
        .split(",")
        .map(String::trim)
        .filter(String::isNotEmpty)
        .map(::IpAddressMatcher)

    private val authPolicyDefinition =
        rateLimitProperties.auth.toDefinition("auth", RateLimitSubjectType.CLIENT_IP)
    private val publicCreatePolicyDefinition =
        rateLimitProperties.publicCreate.toDefinition("public_create", RateLimitSubjectType.CLIENT_IP)
    private val publicRedirectPolicyDefinition =
        rateLimitProperties.publicRedirect.toDefinition("public_redirect", RateLimitSubjectType.CLIENT_IP)
    private val frontendLogsPolicyDefinition =
        rateLimitProperties.frontendLogs.toDefinition("frontend_logs", RateLimitSubjectType.CLIENT_IP)
    private val authenticatedApiPolicyDefinition =
        rateLimitProperties.authenticatedApi.toDefinition(
            "authenticated_api",
            RateLimitSubjectType.AUTHENTICATED_USER_OR_IP
        )

    @Bean
    fun rateLimitBuckets(): Cache<String, Bucket> {
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
        buckets: Cache<String, Bucket>,
        errorResponseWriter: com.zufar.urlshortener.shared.http.ErrorResponseWriter,
        clientIpResolver: com.zufar.urlshortener.shared.http.ClientIpResolver,
        meterRegistry: MeterRegistry
    ): com.zufar.urlshortener.shared.filter.RateLimitFilter = com.zufar.urlshortener.shared.filter.RateLimitFilter(
        rateLimitConfig = this,
        buckets = buckets,
        errorResponseWriter = errorResponseWriter,
        clientIpResolver = clientIpResolver,
        meterRegistry = meterRegistry
    )

    fun createBucket(policy: RateLimitPolicyDefinition): Bucket {
        val limit = Bandwidth.builder()
            .capacity(policy.capacity)
            .refillIntervally(policy.refillTokens, policy.refillPeriod)
            .build()
        return Bucket.builder()
            .addLimit(limit)
            .build()
    }

    fun isEnabled(): Boolean = rateLimitProperties.enabled

    fun authPolicy(): RateLimitPolicyDefinition = authPolicyDefinition

    fun publicCreatePolicy(): RateLimitPolicyDefinition = publicCreatePolicyDefinition

    fun publicRedirectPolicy(): RateLimitPolicyDefinition = publicRedirectPolicyDefinition

    fun frontendLogsPolicy(): RateLimitPolicyDefinition = frontendLogsPolicyDefinition

    fun authenticatedApiPolicy(): RateLimitPolicyDefinition = authenticatedApiPolicyDefinition

    fun isTrustedProxy(remoteAddress: String?): Boolean {
        if (remoteAddress.isNullOrBlank() || trustedProxyMatchers.isEmpty()) {
            return false
        }

        return trustedProxyMatchers.any { it.matches(remoteAddress) }
    }
}
