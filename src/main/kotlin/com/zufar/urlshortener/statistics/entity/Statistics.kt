package com.zufar.urlshortener.statistics.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "statistics")
data class Statistics(

    @Id
    val id: String,
    val userId: String,
    val totalShortLinksCount: Long = 0,
    val totalVisitsCount: Long = 0,
    val urlStatistics: List<UrlStatistics> = emptyList()
)

data class UrlStatistics(

    val urlHash: String,
    val shortenedUrl: String,
    val originalUrl: String,
    val totalVisitsCount: Long = 0,
)
