package com.zufar.urlshortener.common.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "urls-mapping")
data class UrlMapping(

    @Id
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