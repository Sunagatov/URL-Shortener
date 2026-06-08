package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.shared.exception.ApplicationException
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.stereotype.Service
import java.net.Inet4Address
import java.net.Inet6Address
import java.net.InetAddress
import java.net.InetAddress.getAllByName
import java.net.URI

private const val MAX_ALLOWED_URL_LENGTH = 2048
private const val INVALID_URL_REQUEST_CODE = "INVALID_URL_REQUEST"

@Service
class UrlValidator(
    @Value($$"${app.base-url}") private val baseUrl: String,
    @Value($$"${app.urls.protection.blocked-hosts:}") blockedHostnames: String = "",
    private val hostResolver: HostResolver
) {
    private val allowedProtocols = setOf("http", "https")
    private val validator = org.apache.commons.validator.routines.UrlValidator(allowedProtocols.toTypedArray())
    private val blockedHosts = setOf("localhost") + listOfNotNull(parseHost(baseUrl)) + parseCsv(blockedHostnames)

    fun validateUrl(url: String) {
        validate(url.isNotBlank(), "URL must not be empty or blank.")
        validate(!url.contains(" "), "URL must not contain spaces.")
        validate(url.length <= MAX_ALLOWED_URL_LENGTH, "URL exceeds the maximum allowed length of $MAX_ALLOWED_URL_LENGTH characters.")
        validate(hasValidProtocol(url), "URL must have a proper scheme (http or https).")
        validate(validator.isValid(url), "URL is not valid. Please ensure it has the correct format and syntax.")

        val uri = parseUri(url)
        validate(uri.userInfo == null, "URL must not contain embedded user credentials.")
        validate(
            isValidHost(uri),
            "URL host must be public and routable. Private, loopback, link-local, reserved, and current service hosts are not allowed."
        )
    }

    private fun validate(condition: Boolean, message: String) {
        if (!condition) {
            throw ApplicationException.badRequest(INVALID_URL_REQUEST_CODE, message)
        }
    }

    private fun hasValidProtocol(url: String): Boolean =
        allowedProtocols.any { url.startsWith("$it://") }

    private fun isValidHost(uri: URI): Boolean {
        val host = uri.host?.normalizeHost()?.takeIf { it.isNotBlank() } ?: return false

        if (isBlockedHostName(host)) {
            return false
        }

        val addresses = runCatching { hostResolver.resolve(host) }
            .getOrElse { return false }

        if (addresses.isEmpty()) {
            return false
        }

        return addresses.none(::isBlockedResolvedAddress)
    }

    private fun parseHost(value: String): String? {
        return try {
            parseUri(value).host?.normalizeHost()?.takeIf { it.isNotBlank() }
        } catch (_: Exception) {
            null
        }
    }

    private fun parseCsv(value: String): Set<String> =
        value
            .split(",")
            .map(String::trim)
            .map { it.normalizeHost() }
            .filter(String::isNotEmpty)
            .toSet()

    private fun isBlockedHostName(host: String): Boolean =
        blockedHosts.any { host == it || host.endsWith(".$it") } ||
            host.endsWith(".localhost") ||
            !host.isIpLiteral() && !host.contains(".")

    private fun String.normalizeHost(): String =
        lowercase().trimEnd('.')

    private fun parseUri(value: String): URI = URI(value)

    private fun String.isIpLiteral(): Boolean =
        matches(Regex("^\\d{1,3}(\\.\\d{1,3}){3}$")) || contains(":")

    private fun isBlockedResolvedAddress(address: InetAddress): Boolean {
        if (address.isAnyLocalAddress ||
            address.isLoopbackAddress ||
            address.isLinkLocalAddress ||
            address.isSiteLocalAddress ||
            address.isMulticastAddress
        ) {
            return true
        }

        return when (address) {
            is Inet4Address -> isBlockedIpv4(address)
            is Inet6Address -> isBlockedIpv6(address)
            else -> true
        }
    }

    private fun isBlockedIpv4(address: Inet4Address): Boolean {
        val bytes = address.address
        val first = bytes[0].toInt() and 0xFF
        val second = bytes[1].toInt() and 0xFF
        val third = bytes[2].toInt() and 0xFF

        return first == 0 ||
            first == 10 ||
            first == 127 ||
            (first == 100 && second in 64..127) ||
            (first == 169 && second == 254) ||
            (first == 172 && second in 16..31) ||
            (first == 192 && second == 0 && third == 0) ||
            (first == 192 && second == 0 && third == 2) ||
            (first == 192 && second == 88 && third == 99) ||
            (first == 192 && second == 168) ||
            (first == 198 && second in 18..19) ||
            (first == 198 && second == 51 && third == 100) ||
            (first == 203 && second == 0 && third == 113) ||
            first >= 240
    }

    private fun isBlockedIpv6(address: Inet6Address): Boolean {
        val bytes = address.address
        val first = bytes[0].toInt() and 0xFF
        val second = bytes[1].toInt() and 0xFF
        val third = bytes[2].toInt() and 0xFF
        val fourth = bytes[3].toInt() and 0xFF

        return (first and 0xFE) == 0xFC ||
            (first == 0x20 && second == 0x01 && third == 0x0D && fourth == 0xB8)
    }
}

fun interface HostResolver {
    fun resolve(host: String): List<InetAddress>
}

@Component
class DnsHostResolver : HostResolver {
    override fun resolve(host: String): List<InetAddress> =
        getAllByName(host).toList()
}
