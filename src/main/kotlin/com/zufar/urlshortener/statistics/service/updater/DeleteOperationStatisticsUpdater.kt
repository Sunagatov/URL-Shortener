package com.zufar.urlshortener.statistics.service.updater

import com.zufar.urlshortener.shorten.repository.UrlRepository
import com.zufar.urlshortener.statistics.entity.Statistics
import com.zufar.urlshortener.statistics.repository.StatisticsRepository
import org.springframework.data.mongodb.core.MongoOperations
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class DeleteOperationStatisticsUpdater(
    private val statisticsRepository: StatisticsRepository,
    private val urlRepository: UrlRepository,
    private val mongoOperations: MongoOperations
) {

    fun update(userId: String, urlHash: String) {
        val statistics = statisticsRepository.findByUserId(userId)
        val now = LocalDateTime.now()

        if (statistics == null) {
            val totalShortLinksCount = urlRepository.countByUserId(userId) - 1
            val newStatistics = Statistics(
                userId = userId,
                totalShortLinksCount = totalShortLinksCount,
                totalVisitsCount = 0,
                urlStatistics = mutableListOf(),
                createdAt = now,
                updatedAt = now
            )
            statisticsRepository.save(newStatistics)
            return
        }

        val urlStat = statistics.urlStatistics.find { it.urlHash == urlHash }
        val totalVisitsToDecrement = urlStat?.totalVisitsCount ?: 0

        val updatedStatistics = statistics.copy(
            totalShortLinksCount = statistics.totalShortLinksCount - 1,
            totalVisitsCount = statistics.totalVisitsCount - totalVisitsToDecrement,
            updatedAt = now,
            urlStatistics = statistics.urlStatistics.filter { it.urlHash != urlHash }
        )

        val query = Query(Criteria.where("userId").`is`(userId))
        val update = org.springframework.data.mongodb.core.query.Update()
            .set("totalShortLinksCount", updatedStatistics.totalShortLinksCount)
            .set("totalVisitsCount", updatedStatistics.totalVisitsCount)
            .set("modifiedDateTime", now)
            .pull("urlStatistics", Query.query(Criteria.where("urlHash").`is`(urlHash)))

        mongoOperations.updateFirst(query, update, Statistics::class.java)
    }
}
