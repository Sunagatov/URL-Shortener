package com.zufar.urlshortener.urls.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "url_quota_buckets")
data class UrlQuotaBucket(
    @Id val id: String,
    val admissions: List<Instant> = emptyList(),
    @Indexed(name = "url_quota_expiration_ttl_idx", expireAfter = "0s")
    val expiresAt: Instant
)
