package com.zufar.urlshortener.shared.logging

import java.net.URI

object LogSanitizer {

    fun maskEmail(email: String?): String {
        val normalized = email?.trim()?.lowercase().orEmpty()
        if (normalized.isBlank()) {
            return "unknown"
        }

        val atIndex = normalized.indexOf('@')
        if (atIndex <= 0 || atIndex == normalized.lastIndex) {
            return "invalid"
        }

        val localPart = normalized.substring(0, atIndex)
        val domain = normalized.substring(atIndex + 1)
        val visiblePrefix = localPart.take(2)
        return "$visiblePrefix***@$domain"
    }

    fun emailDomain(email: String?): String =
        email
            ?.trim()
            ?.substringAfter('@', "")
            ?.lowercase()
            ?.ifBlank { "unknown" }
            ?: "unknown"

    fun safeUrlHost(rawUrl: String?): String {
        val normalized = rawUrl?.trim().orEmpty()
        if (normalized.isBlank()) {
            return "unknown"
        }

        return runCatching { URI(normalized).host }
            .getOrNull()
            ?.lowercase()
            ?.ifBlank { "unknown" }
            ?: "invalid"
    }
}
