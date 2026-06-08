package com.zufar.urlshortener.moderation.repository

import com.zufar.urlshortener.moderation.entity.AbuseReport
import org.springframework.data.mongodb.repository.MongoRepository

interface AbuseReportRepository : MongoRepository<AbuseReport, String>
