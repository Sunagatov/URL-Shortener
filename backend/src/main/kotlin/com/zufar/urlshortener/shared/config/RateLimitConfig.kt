package com.zufar.urlshortener.shared.config

import com.zufar.urlshortener.shared.web.RateLimitedRoute
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.security.web.util.matcher.IpAddressMatcher
import java.time.Duration

data class RateLimitPolicy(val name: String,
                           val subjectKey: RateLimitSubjectKey,
                           val capacity: Long,
                           val refillTokens: Long,
                           val refillPeriod: Duration)

enum class RateLimitSubjectKey { CLIENT_IP, AUTHENTICATED_USER_OR_IP }

@Configuration
@EnableConfigurationProperties(RateLimitProperties::class)
class RateLimitConfig(
    private val rateLimitProperties: RateLimitProperties
) {
    private val trustedProxyMatchers = rateLimitProperties.trustedProxies
        .split(",")
        .map(String::trim)
        .filter(String::isNotEmpty)
        .map(::IpAddressMatcher)

    private val policiesByRoute = mapOf(
        RateLimitedRoute.AUTH to policy("auth", rateLimitProperties.auth, RateLimitSubjectKey.CLIENT_IP),
        RateLimitedRoute.PUBLIC_CREATE to policy("public_create", rateLimitProperties.publicCreate, RateLimitSubjectKey.AUTHENTICATED_USER_OR_IP),
        RateLimitedRoute.PUBLIC_REDIRECT to policy("public_redirect", rateLimitProperties.publicRedirect, RateLimitSubjectKey.CLIENT_IP),
        RateLimitedRoute.FRONTEND_LOGS to policy("frontend_logs", rateLimitProperties.frontendLogs, RateLimitSubjectKey.CLIENT_IP),
        RateLimitedRoute.AUTHENTICATED_API to policy("authenticated_api", rateLimitProperties.authenticatedApi, RateLimitSubjectKey.AUTHENTICATED_USER_OR_IP)
    )

    fun isEnabled(): Boolean = rateLimitProperties.enabled

    fun policyFor(route: RateLimitedRoute): RateLimitPolicy? = policiesByRoute[route]

    fun isTrustedProxy(remoteAddress: String?): Boolean {
        if (remoteAddress.isNullOrBlank() || trustedProxyMatchers.isEmpty()) {
            return false
        }

        return trustedProxyMatchers.any { it.matches(remoteAddress) }
    }

    private fun policy(name: String,
                       properties: BucketPolicyProperties,
                       subjectKey: RateLimitSubjectKey): RateLimitPolicy = RateLimitPolicy(
        name = name,
        subjectKey = subjectKey,
        capacity = properties.capacity,
        refillTokens = properties.refillTokens,
        refillPeriod = Duration.ofMinutes(properties.refillMinutes)
    )
}
