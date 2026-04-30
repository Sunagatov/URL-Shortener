package com.zufar.urlshortener.urls.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "url_mappings")
data class UrlMapping(

    @Id
    val urlHash: String,
    val shortUrl: String,
    val originalUrl: String,
    val clickCount: Long = 0,

    val createdAt: LocalDateTime,
    @Indexed(name = "expiration_date_ttl_idx", expireAfterSeconds = 0)
    val expirationDate: LocalDateTime,

    val requestIp: String?,
    val userAgent: String?,

    @Indexed(name = "user_id_idx")
    val userId: String?
)
