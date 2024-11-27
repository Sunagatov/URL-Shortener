package com.zufar.urlshortener.statistics.repository

import com.zufar.urlshortener.statistics.entity.Statistics
import org.springframework.data.mongodb.repository.MongoRepository

interface StatisticsRepository : MongoRepository<Statistics, String> {

    fun findByUserId(userId: String): Statistics?
}
