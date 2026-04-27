package com.zufar.urlshortener.shorten.dto

import com.zufar.urlshortener.shorten.entity.UrlMapping
import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(description = "Data transfer object for URL mapping")
data class UrlMappingDto(

    @Schema(description = "Unique hash for the shortened URL", example = "abc123")
    val urlHash: String,

    @Schema(description = "Shortened URL", example = "http://short.url/abc123")
    val shortUrl: String,

    @Schema(description = "Original URL", example = "http://example.com")
    val originalUrl: String,

    @Schema(description = "Creation timestamp", example = "2023-10-15T12:34:56")
    val createdAt: LocalDateTime,

    @Schema(description = "Expiration timestamp", example = "2023-11-15T12:34:56")
    val expirationDate: LocalDateTime
) {
    companion object {
        fun fromEntity(entity: UrlMapping): UrlMappingDto {
            return UrlMappingDto(
                urlHash = entity.urlHash,
                shortUrl = entity.shortUrl,
                originalUrl = entity.originalUrl,
                createdAt = entity.createdAt,
                expirationDate = entity.expirationDate
            )
        }
    }
}
