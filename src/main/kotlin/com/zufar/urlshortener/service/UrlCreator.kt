package com.zufar.urlshortener.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service


@Service
class UrlCreator {

    @Value("\${app.base-url}")
    private lateinit var baseUrl: String

    private val log = LoggerFactory.getLogger(UrlCreator::class.java)

    fun create(shortUrl: String): String {
        val newShortURL = "$baseUrl/url/$shortUrl"
        log.info("New shortURL='{}' was created ", newShortURL)
        return newShortURL
    }
}