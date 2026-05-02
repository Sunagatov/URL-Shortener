package com.zufar.urlshortener.urls.dto

import com.zufar.urlshortener.urls.entity.UrlMapping
import java.time.LocalDateTime

data class UrlMappingDto(

    val urlHash: String,

    val shortUrl: String,

    val originalUrl: String,

    val clickCount: Long,

    val qrScanCount: Long,

    val createdAt: LocalDateTime,

    val expirationDate: LocalDateTime
) {
    companion object {
        fun fromEntity(entity: UrlMapping): UrlMappingDto = UrlMappingDto(
            urlHash = entity.urlHash,
            shortUrl = entity.shortUrl,
            originalUrl = entity.originalUrl,
            clickCount = entity.clickCount,
            qrScanCount = entity.qrScanCount,
            createdAt = entity.createdAt,
            expirationDate = entity.expirationDate
        )
    }
}
