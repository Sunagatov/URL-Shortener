package com.zufar.urlshortener.urls.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.net.URI
import java.net.URL

private const val MAX_ALLOWED_URL_LENGTH = 2048

@Service
class UrlValidator(
    @Value("\${app.base-url}") private val baseUrl: String
) {
    private val allowedProtocols = setOf("http", "https")
    private val loopbackHosts = setOf("localhost", "127.0.0.1", "::1")
    private val validator = org.apache.commons.validator.routines.UrlValidator(allowedProtocols.toTypedArray())

    fun validateUrl(url: String) {
        require(url.isNotBlank()) { "URL must not be empty or blank." }
        require(!url.contains(" ")) { "URL must not contain spaces." }
        require(url.length <= MAX_ALLOWED_URL_LENGTH) { "URL exceeds the maximum allowed length of $MAX_ALLOWED_URL_LENGTH characters." }
        require(hasValidProtocol(url)) { "URL must have a proper scheme (http or https)." }
        require(validator.isValid(url)) { "URL is not valid. Please ensure it has the correct format and syntax." }
        require(isValidHost(url)) { "URL must contain a valid host. Loopback addresses and the current shortener host are not allowed." }
    }

    private fun hasValidProtocol(url: String): Boolean =
        allowedProtocols.any { url.startsWith("$it://") }

    private fun isValidHost(url: String): Boolean {
        val host = parseHost(url) ?: return false

        val blockedHosts = buildSet {
            addAll(loopbackHosts)
            parseHost(baseUrl)?.let { add(it) }
        }

        return host !in blockedHosts
    }

    private fun parseHost(value: String): String? {
        return try {
            val parsedUrl: URL = URI(value).toURL()
            parsedUrl.host?.lowercase()?.takeIf { it.isNotBlank() }
        } catch (_: Exception) {
            null
        }
    }
}
