package com.zufar.urlshortener.urls.dto

import com.zufar.urlshortener.urls.entity.UrlMapping
import java.time.Instant

data class UrlMappingDto(

    val urlHash: String,

    val shortUrl: String,

    val originalUrl: String,

    val clickCount: Long,

    val qrScanCount: Long,

    val createdAt: Instant,

    val expirationDate: Instant,

    val safetyInterstitialRequired: Boolean = false,

    val safetyInterstitialReason: String? = null,

    val disabled: Boolean = false,

    val disabledReason: String? = null,

    val disabledAt: Instant? = null
) {
    companion object {
        fun fromEntity(entity: UrlMapping): UrlMappingDto = UrlMappingDto(
            urlHash = entity.urlHash,
            shortUrl = entity.shortUrl,
            originalUrl = entity.originalUrl,
            clickCount = entity.clickCount,
            qrScanCount = entity.qrScanCount,
            createdAt = entity.createdAt,
            expirationDate = entity.expirationDate,
            safetyInterstitialRequired = entity.safetyInterstitialRequired,
            safetyInterstitialReason = entity.safetyInterstitialReason,
            disabled = entity.disabled,
            disabledReason = entity.disabledReason,
            disabledAt = entity.disabledAt
        )
    }
}
