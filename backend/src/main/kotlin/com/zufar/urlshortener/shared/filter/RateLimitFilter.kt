package com.zufar.urlshortener.shared.filter

import com.github.benmanes.caffeine.cache.Cache
import com.zufar.urlshortener.shared.ANONYMOUS_USER
import com.zufar.urlshortener.shared.AUTHENTICATED_USER_ID_ATTRIBUTE
import com.zufar.urlshortener.shared.config.RateLimitConfig
import com.zufar.urlshortener.shared.config.RateLimitBucketFactory
import com.zufar.urlshortener.shared.config.RateLimitPolicy
import com.zufar.urlshortener.shared.config.RateLimitSubjectKey
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.http.ErrorResponseWriter
import com.zufar.urlshortener.shared.web.ApplicationRoutes
import io.github.bucket4j.Bucket
import io.github.bucket4j.ConsumptionProbe
import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.web.filter.OncePerRequestFilter
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.ceil

private const val RETRY_AFTER_HEADER = "Retry-After"
private const val RATE_LIMIT_LIMIT_HEADER = "X-RateLimit-Limit"
private const val RATE_LIMIT_REMAINING_HEADER = "X-RateLimit-Remaining"
private const val RATE_LIMIT_RESET_HEADER = "X-RateLimit-Reset"
private const val RATE_LIMIT_ERROR_MESSAGE = "Too many requests. Please try again later."
private const val RATE_LIMIT_EXCEEDED_CODE = "RATE_LIMIT_EXCEEDED"
private const val RATE_LIMIT_OUTCOME_ALLOWED = "allowed"
private const val RATE_LIMIT_OUTCOME_BLOCKED = "blocked"

class RateLimitFilter(
    private val rateLimitConfig: RateLimitConfig,
    private val rateLimitBucketFactory: RateLimitBucketFactory,
    private val buckets: Cache<String, Bucket>,
    private val errorResponseWriter: ErrorResponseWriter,
    private val clientIpResolver: ClientIpResolver,
    private val meterRegistry: MeterRegistry
) : OncePerRequestFilter() {

    private val log = LoggerFactory.getLogger(RateLimitFilter::class.java)
    private val counters = ConcurrentHashMap<String, Counter>()

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        if (!rateLimitConfig.isEnabled()) {
            return true
        }

        return ApplicationRoutes.shouldBypassRateLimit(request)
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val policy = resolvePolicy(request)
        if (policy == null) {
            filterChain.doFilter(request, response)
            return
        }

        val clientIp = clientIpResolver.resolve(request)
        val subject = resolveSubject(policy, request, clientIp)
        val cacheKey = "${policy.name}:$subject"
        val bucket = buckets.get(cacheKey) { rateLimitBucketFactory.create(policy) }
        val probe = bucket.tryConsumeAndReturnRemaining(1)

        applyRateLimitHeaders(response, policy, probe)

        if (probe.isConsumed) {
            incrementCounter(policy, RATE_LIMIT_OUTCOME_ALLOWED)
            filterChain.doFilter(request, response)
        } else {
            incrementCounter(policy, RATE_LIMIT_OUTCOME_BLOCKED)
            log.warn(
                "rate_limit_exceeded policy={} method={} path={} subjectType={} subject={} clientIp={} retryAfterSeconds={}",
                policy.name,
                request.method,
                request.requestURI,
                policy.subjectKey.name.lowercase(),
                subject,
                clientIp,
                toRetryAfterSeconds(probe)
            )
            writeRateLimitExceededResponse(request, response, probe)
        }
    }

    private fun resolvePolicy(request: HttpServletRequest): RateLimitPolicy? =
        ApplicationRoutes.resolveRateLimitedRoute(request)
            ?.let(rateLimitConfig::policyFor)

    private fun resolveSubject(
        policy: RateLimitPolicy,
        request: HttpServletRequest,
        clientIp: String
    ): String = when (policy.subjectKey) {
        RateLimitSubjectKey.CLIENT_IP -> "ip:$clientIp"
        RateLimitSubjectKey.AUTHENTICATED_USER_OR_IP -> {
            val userId = request.getAttribute(AUTHENTICATED_USER_ID_ATTRIBUTE)
                ?.toString()
                ?.takeIf(String::isNotBlank)
                ?: request.userPrincipal?.name?.takeUnless { it.isBlank() || it == ANONYMOUS_USER }
            userId?.let { "user:$it" } ?: "ip:$clientIp"
        }
    }

    private fun applyRateLimitHeaders(
        response: HttpServletResponse,
        policy: RateLimitPolicy,
        probe: ConsumptionProbe
    ) {
        response.setHeader(RATE_LIMIT_LIMIT_HEADER, policy.capacity.toString())
        response.setHeader(RATE_LIMIT_REMAINING_HEADER, probe.remainingTokens.toString())
        response.setHeader(RATE_LIMIT_RESET_HEADER, toRetryAfterSeconds(probe).toString())
    }

    private fun writeRateLimitExceededResponse(
        request: HttpServletRequest,
        response: HttpServletResponse,
        probe: ConsumptionProbe
    ) {
        val retryAfterSeconds = toRetryAfterSeconds(probe)
        response.setHeader(RETRY_AFTER_HEADER, retryAfterSeconds.toString())

        errorResponseWriter.write(
            request,
            response,
            HttpStatus.TOO_MANY_REQUESTS,
            RATE_LIMIT_ERROR_MESSAGE,
            RATE_LIMIT_EXCEEDED_CODE,
            retryAfterSeconds
        )
    }

    private fun incrementCounter(policy: RateLimitPolicy, outcome: String) {
        val key = "${policy.name}:$outcome"
        counters.computeIfAbsent(key) {
            Counter.builder("rate_limit_requests_total")
                .description("Rate limit decision count")
                .tag("policy", policy.name)
                .tag("outcome", outcome)
                .register(meterRegistry)
        }.increment()
    }

    private fun toRetryAfterSeconds(probe: ConsumptionProbe): Long {
        val nanosToWait = probe.nanosToWaitForRefill
        if (nanosToWait <= 0) {
            return 0
        }
        return ceil(nanosToWait / 1_000_000_000.0).toLong()
    }
}
