package com.zufar.urlshortener.urls.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "url_creation_burst_buckets")
@CompoundIndex(name = "creator_key_bucket_second_idx", def = "{'creatorKey': 1, 'bucketSecond': 1}")
data class UrlCreationBurstBucket(
    @Id
    val id: String,
    val creatorKey: String,
    val bucketSecond: Instant,
    val count: Long = 0,
    @Indexed(name = "creation_burst_bucket_expiration_ttl_idx", expireAfter = "0s")
    val expiresAt: Instant
)
