package com.zufar.urlshortener.moderation.repository

import com.zufar.urlshortener.moderation.entity.AbuseReport
import org.springframework.data.mongodb.repository.MongoRepository
import java.time.Instant

interface AbuseReportRepository : MongoRepository<AbuseReport, String> {
    fun countByUrlHashAndCreatedAtAfter(urlHash: String, createdAt: Instant): Long
}
