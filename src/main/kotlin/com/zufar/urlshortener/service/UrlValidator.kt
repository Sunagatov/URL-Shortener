package com.zufar.urlshortener.service

import org.springframework.stereotype.Service
import java.net.URI
import java.net.URL
import java.util.regex.Pattern

private const val MAX_ALLOWED_URL_LENGTH = 2000
private const val MAX_LABEL_LENGTH = 63
private const val MIN_LABEL_LENGTH = 2
private const val URL_SPACE = " "
private const val URL_LABEL_PATTERN = "^[a-zA-Z0-9][-a-zA-Z0-9]{0,61}[a-zA-Z0-9]?$"

@Service
class UrlValidator {

    private val allowedProtocols = setOf("http", "https")
    private val loopbackAddresses = setOf("localhost", "127.0.0.1", "::1", "short-link.zufargroup.com")
    private val labelPattern = Pattern.compile(URL_LABEL_PATTERN)

    fun validateUrl(url: String) {
        require(url.isNotEmpty() && url.isNotBlank()) { "URL must not be empty or blank" }
        require(!url.contains(URL_SPACE)) { "URL must not contain spaces" }

        val parsedUrl: URL = URI(url).toURL()
        val host = parsedUrl.host

        require(parsedUrl.protocol in allowedProtocols) { "URL must use HTTP or HTTPS protocol" }
        require(!host.isNullOrBlank()) { "URL must have a valid host" }
        require(host !in loopbackAddresses) { "URL cannot point to a loopback address" }
        require(url.length <= MAX_ALLOWED_URL_LENGTH) { "URL is too long" }

        val labels = host.split(".")
        require(labels.size >= 2) { "URL must have at least two labels (e.g., 'example.com')" }

        labels.forEach { label ->
            when {
                label.isEmpty() -> {
                    throw IllegalArgumentException("A label in the domain cannot be empty. Labels are the parts of the domain separated by dots (e.g., 'example' in 'example.com'). Ensure there are valid characters between the dots.")
                }
                label.length < MIN_LABEL_LENGTH -> {
                    throw IllegalArgumentException("Label '$label' is too short (minimum length is $MIN_LABEL_LENGTH characters). Labels must contain valid characters and consist of alphanumeric characters or dashes.")
                }
                label.length > MAX_LABEL_LENGTH -> {
                    throw IllegalArgumentException("Label '$label' is too long (maximum length is $MAX_LABEL_LENGTH characters). Labels must contain valid characters and consist of alphanumeric characters or dashes.")
                }
                !labelPattern.matcher(label).matches() -> {
                    throw IllegalArgumentException("Label '$label' in the domain is invalid. Labels can only contain alphanumeric characters and dashes.")
                }
            }
        }
    }
}
