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

    val createdAt: LocalDateTime,
    val expirationDate: LocalDateTime,

    val requestIp: String?,
    val userAgent: String?,

    val userId: String?
)