package com.zufar.urlshortener.service

import org.springframework.stereotype.Service
import java.net.URI
import java.net.URL

@Service
class UrlValidator {

    private val allowedProtocols = setOf("http", "https")
    private val loopbackAddresses = setOf("localhost", "127.0.0.1", "::1", "short-link.zufargroup.com")

    fun validateUrl(url: String) {
        // Check for spaces in the URL
        require(!url.contains(" ")) {
            "URL must not contain spaces"
        }

        val parsedUrl: URL = URI(url).toURL()

        // Validate the host part of the URL
        require(!parsedUrl.host.isNullOrBlank()) {
            "URL must have a valid host"
        }

        // Check for allowed protocols (only http or https)
        require(parsedUrl.protocol in allowedProtocols) {
            "URL must use HTTP or HTTPS protocol"
        }

        // Prevent loopback addresses
        require(parsedUrl.host !in loopbackAddresses) {
            "URL cannot point to a loopback address"
        }

        // Check if the URL is too long
        require(url.length <= 2000) {
            "URL is too long"
        }
    }
}
