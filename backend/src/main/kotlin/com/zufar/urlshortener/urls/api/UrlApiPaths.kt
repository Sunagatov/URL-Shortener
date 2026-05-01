package com.zufar.urlshortener.urls.api

import org.springframework.http.HttpMethod
import org.springframework.security.web.util.matcher.RegexRequestMatcher

object UrlApiPaths {
    const val BASE_PATH = "/api/v1/urls"

    fun publicRedirectMatcher(): RegexRequestMatcher =
        RegexRequestMatcher(UrlHashFormat.SECURITY_REGEX, HttpMethod.GET.name())
}
