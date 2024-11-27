package com.zufar.urlshortener.statistics.service.updater

import com.zufar.urlshortener.shorten.repository.UrlRepository
import com.zufar.urlshortener.statistics.entity.Statistics
import com.zufar.urlshortener.statistics.repository.StatisticsRepository
import org.springframework.stereotype.Service

@Service
class DeleteOperationStatisticsUpdater(
    private val statisticsRepository: StatisticsRepository,
    private val urlRepository: UrlRepository
) {

    fun update(userId: String, urlHash: String) {
        val statistics = statisticsRepository.findByUserId(userId)

        if (statistics == null) {
            val totalShortLinksCount = urlRepository.countByUserId(userId) - 1 // Subtracting the deleted URL
            val newStatistics = Statistics(
                userId = userId,
                totalShortLinksCount = totalShortLinksCount,
                totalVisitsCount = 0,
                urlStatistics = mutableListOf()
            )
            statisticsRepository.save(newStatistics)
            return
        }
        // Update existing statistics
        statistics.totalShortLinksCount -= 1
        val urlStat = statistics.urlStatistics.find { it.urlHash == urlHash }
        if (urlStat != null) {
            statistics.totalVisitsCount -= urlStat.totalVisitsCount
            statistics.urlStatistics.remove(urlStat)
        }
        statisticsRepository.save(statistics)
    }
}
