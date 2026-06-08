package com.zufar.urlshortener.urls.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "url_mappings")
data class UrlMapping(

    @Id
    val urlHash: String,
    val shortUrl: String,
    val originalUrl: String,
    val clickCount: Long = 0,
    val qrScanCount: Long = 0,
    val lastQrScannedAt: Instant? = null,

    val createdAt: Instant,
    @Indexed(name = "expiration_date_ttl_idx", expireAfter = "0s")
    val expirationDate: Instant,

    val requestIp: String?,
    val userAgent: String?,
    val requestIpHash: String? = null,
    val userAgentHash: String? = null,
    @Indexed(name = "creator_key_idx")
    val creatorKey: String? = null,
    @Indexed(name = "target_host_idx")
    val targetHost: String? = null,

    @Indexed(name = "user_id_idx")
    val userId: String?,

    val safetyInterstitialRequired: Boolean = false,
    val safetyInterstitialReason: String? = null,
    val disabled: Boolean = false,
    val disabledReason: String? = null,
    val disabledAt: Instant? = null
)
