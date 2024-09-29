package com.zufar.urlshortener.service

import org.springframework.stereotype.Service
import java.net.URI
import java.net.URL

private const val MAX_ALLOWED_URL_LENGTH = 2048

@Service
class UrlValidator {

    private val allowedProtocols = setOf("http", "https")
    private val loopbackAddresses = setOf("localhost", "127.0.0.1", "::1", "short-link.zufargroup.com")
    private val validator = org.apache.commons.validator.routines.UrlValidator()

    fun validateUrl(url: String) {
        require(url.isNotBlank()) { "URL must not be empty or blank." }
        require(!url.contains(" ")) { "URL must not contain spaces." }
        require(url.length <= MAX_ALLOWED_URL_LENGTH) { "URL exceeds the maximum allowed length of $MAX_ALLOWED_URL_LENGTH characters." }
        require(validator.isValid(url)) { "URL is not valid. Please ensure it has the correct format and syntax." }
        require(isValidProtocol(url)) { "URL must have a proper scheme (e.g., http or https)." }
        require(isValidHost(url)) { "URL must contain a valid host. Loopback addresses (localhost, 127.0.0.1, ::1, short-link.zufargroup.com) are not allowed." }
    }

    private fun isValidProtocol(url: String): Boolean {
        val parsedUrl: URL = URI(url).toURL()
        return parsedUrl.protocol in allowedProtocols
    }

    private fun isValidHost(url: String): Boolean {
        val parsedUrl: URL = URI(url).toURL()
        val host = parsedUrl.host
        return !host.isNullOrBlank() && host !in loopbackAddresses
    }
}
