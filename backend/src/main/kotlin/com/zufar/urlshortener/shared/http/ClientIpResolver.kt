package com.zufar.urlshortener.shared.http

import com.zufar.urlshortener.shared.X_FORWARDED_FOR_HEADER
import com.zufar.urlshortener.shared.config.RateLimitConfig
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Component

@Component
class ClientIpResolver(
    private val rateLimitConfig: RateLimitConfig
) {

    fun resolve(request: HttpServletRequest): String {
        val forwardedFor = request.getHeader(X_FORWARDED_FOR_HEADER)
            ?.takeIf { rateLimitConfig.isTrustedProxy(request.remoteAddr) }
            ?.split(",")
            ?.firstNotNullOfOrNull { it.trim().takeIf(String::isNotEmpty) }

        return forwardedFor ?: request.remoteAddr
    }
}
