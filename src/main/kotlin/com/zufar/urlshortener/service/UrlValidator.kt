package com.zufar.urlshortener.service

import org.springframework.stereotype.Service
import java.net.URI
import java.net.URL

@Service
class UrlValidator {

    fun validateUrl(url: String) {
        val parsedUrl: URL = URI(url).toURL()

        // Check for allowed protocols
        if (parsedUrl.protocol != "http" && parsedUrl.protocol != "https") {
            throw IllegalArgumentException("URL must use HTTP or HTTPS protocol")
        }

        // Validate the host part of the URL
        if (parsedUrl.host.isNullOrBlank()) {
            throw IllegalArgumentException("URL must have a valid host")
        }

        // Prevent loopback addresses like localhost or 127.0.0.1
        if (parsedUrl.host == "localhost" || parsedUrl.host == "127.0.0.1") {
            throw IllegalArgumentException("URL cannot point to a loopback address")
        }

        // Check if the URL is too long
        if (url.length > 2000) {
            throw IllegalArgumentException("URL is too long")
        }
    }
}
