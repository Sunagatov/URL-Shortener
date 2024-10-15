package com.zufar.urlshortener.shorten.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "url_mappings")
data class UrlMapping(

    @Id
    val urlHash: String,
    val shortUrl: String,
    val originalUrl: String,

    // URL metadata
    val createdAt: LocalDateTime,
    val expirationDate: LocalDateTime,

    // Request-related metadata
    val requestIp: String?,
    val userAgent: String?,
    val referer: String?,
    val acceptLanguage: String?,
    val httpMethod: String
)