package com.zufar.urlshortener.shared.http

import com.zufar.urlshortener.shared.X_FORWARDED_FOR_HEADER
import com.zufar.urlshortener.shared.config.RateLimitConfig
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Component
import java.net.Inet6Address
import java.net.InetAddress

@Component
class ClientIpResolver(
    private val rateLimitConfig: RateLimitConfig
) {

    fun resolve(request: HttpServletRequest): String {
        val peer = request.remoteAddr
        if (!rateLimitConfig.isTrustedProxy(peer)) return peer
        val header = request.getHeader(X_FORWARDED_FOR_HEADER) ?: return peer
        if (header.length > 2048) return peer
        val chain = header.split(',').map(String::trim)
        if (chain.size > 32 || chain.any { !isLiteralAddress(it) }) return peer

        var address = peer
        for (hop in chain.asReversed()) {
            if (!rateLimitConfig.isTrustedProxy(address)) break
            address = hop
        }
        return address
    }

    private fun isLiteralAddress(value: String): Boolean {
        if (value.contains(':')) {
            if (!value.matches(Regex("[0-9a-fA-F:.]+"))) return false
            return runCatching { InetAddress.getByName(value) is Inet6Address }.getOrDefault(false)
        }
        val parts = value.split('.')
        return parts.size == 4 && parts.all {
            it.isNotEmpty() && it.length <= 3 && it.all { digit -> digit in '0'..'9' } &&
                (it.length == 1 || it[0] != '0') && (it.toIntOrNull() ?: 256) <= 255
        }
    }
}
