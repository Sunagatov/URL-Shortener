package com.zufar.urlshortener.moderation.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "abuse_reports")
data class AbuseReport(
    @Id
    val id: String? = null,
    @Indexed(name = "abuse_report_url_hash_idx")
    val urlHash: String,
    val reason: String?,
    val reporterIpHash: String?,
    val reporterUserAgentHash: String?,
    val createdAt: Instant
)
