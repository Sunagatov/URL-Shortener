package com.zufar.urlshortener.shared.web

import com.zufar.urlshortener.shared.ACTUATOR_PATH_PREFIX
import com.zufar.urlshortener.shared.API_DOCS_PATH_PREFIX
import com.zufar.urlshortener.shared.DOCS_PATH_PREFIX
import com.zufar.urlshortener.urls.api.UrlHashFormat
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpMethod
import org.springframework.security.web.util.matcher.OrRequestMatcher
import org.springframework.security.web.util.matcher.RegexRequestMatcher
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher.withDefaults

enum class RateLimitedRoute {
    AUTH,
    FRONTEND_LOGS,
    PUBLIC_CREATE,
    PUBLIC_REDIRECT,
    AUTHENTICATED_API
}

object ApplicationRoutes {
    const val AUTH_BASE_PATH = "/api/v1/auth"
    const val AUTH_LEGACY_BASE_PATH = "/v1/auth"
    const val URLS_BASE_PATH = "/api/v1/urls"
    const val ADMIN_URL_MAPPINGS_BASE_PATH = "/api/v1/admin/url-mappings"
    const val ABUSE_REPORTS_BASE_PATH = "/api/v1/abuse-reports"
    const val FRONTEND_LOGS_BASE_PATH = "/api/v1/frontend/logs"
    const val HEALTH_BASE_PATH = "/api/v1/health"

    private const val FAVICON_PATH = "/favicon.ico"
    private val optionsMatcher = withDefaults().matcher(HttpMethod.OPTIONS, "/**")
    private val frontendLogsMatcher = withDefaults().matcher(HttpMethod.POST, FRONTEND_LOGS_BASE_PATH)
    private val abuseReportsMatcher = withDefaults().matcher(HttpMethod.POST, ABUSE_REPORTS_BASE_PATH)
    private val publicCreateMatcher = withDefaults().matcher(HttpMethod.POST, URLS_BASE_PATH)
    private val faviconMatcher = withDefaults().matcher(HttpMethod.GET, FAVICON_PATH)
    private val publicRedirectMatcher = RegexRequestMatcher(UrlHashFormat.SECURITY_REGEX, HttpMethod.GET.name())
    private val healthMatcher = withDefaults().matcher(HEALTH_BASE_PATH)
    private val authMatcher = OrRequestMatcher(
        withDefaults().matcher(AUTH_BASE_PATH),
        withDefaults().matcher("$AUTH_BASE_PATH/**"),
        withDefaults().matcher(AUTH_LEGACY_BASE_PATH),
        withDefaults().matcher("$AUTH_LEGACY_BASE_PATH/**")
    )
    private val docsMatcher = withDefaults().matcher("$DOCS_PATH_PREFIX/**")
    private val apiDocsMatcher = withDefaults().matcher("$API_DOCS_PATH_PREFIX/**")
    private val actuatorMatcher = withDefaults().matcher("$ACTUATOR_PATH_PREFIX/**")

    private val securityPermitAllMatchers = arrayOf(
        optionsMatcher,
        frontendLogsMatcher,
        abuseReportsMatcher,
        publicCreateMatcher,
        faviconMatcher,
        publicRedirectMatcher,
        healthMatcher,
        authMatcher,
        docsMatcher,
        apiDocsMatcher
    )

    private val rateLimitBypassMatchers = arrayOf(
        optionsMatcher,
        healthMatcher,
        docsMatcher,
        apiDocsMatcher,
        actuatorMatcher,
        faviconMatcher
    )

    fun securityPermitAllMatchers(): Array<RequestMatcher> = securityPermitAllMatchers.copyOf()

    fun shouldBypassRateLimit(request: HttpServletRequest): Boolean =
        rateLimitBypassMatchers.any { it.matches(request) }

    fun resolveRateLimitedRoute(request: HttpServletRequest): RateLimitedRoute? {
        val path = request.servletPath
        val isApiPath = path.startsWith("/api/")

        return when {
            authMatcher.matches(request) -> RateLimitedRoute.AUTH
            frontendLogsMatcher.matches(request) -> RateLimitedRoute.FRONTEND_LOGS
            publicCreateMatcher.matches(request) -> RateLimitedRoute.PUBLIC_CREATE
            publicRedirectMatcher.matches(request) -> RateLimitedRoute.PUBLIC_REDIRECT
            isApiPath -> RateLimitedRoute.AUTHENTICATED_API
            else -> null
        }
    }
}
