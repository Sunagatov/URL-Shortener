package com.zufar.urlshortener.statistics.service.updater

import com.zufar.urlshortener.shorten.repository.UrlRepository
import com.zufar.urlshortener.statistics.entity.Statistics
import com.zufar.urlshortener.statistics.entity.UrlStatistics
import com.zufar.urlshortener.statistics.repository.StatisticsRepository
import org.springframework.stereotype.Service

@Service
class RedirectOperationStatisticsUpdater(
    private val statisticsRepository: StatisticsRepository,
    private val urlRepository: UrlRepository
) {

    fun updateStatistics(
        userId: String,
        urlHash: String,
        shortenedUrl: String,
        originalUrl: String
    ) {
        val statistics = statisticsRepository.findByUserId(userId)

        if (statistics == null) {
            // Statistics data is absent, create new record
            val totalShortLinksCount = urlRepository.countByUserId(userId)
            val newStatistics = Statistics(
                userId = userId,
                totalShortLinksCount = totalShortLinksCount,
                totalVisitsCount = 1,
                urlStatistics = mutableListOf(
                    UrlStatistics(urlHash, shortenedUrl, originalUrl, totalVisitsCount = 1)
                )
            )
            statisticsRepository.save(newStatistics)
        } else {
            // Update existing statistics
            statistics.totalVisitsCount += 1
            val urlStat = statistics.urlStatistics.find { it.urlHash == urlHash }
            if (urlStat != null) {
                urlStat.totalVisitsCount += 1
            } else {
                statistics.urlStatistics.add(
                    UrlStatistics(
                        urlHash = urlHash,
                        shortenedUrl = shortenedUrl,
                        originalUrl = originalUrl,
                        totalVisitsCount = 1
                    )
                )
            }
            statisticsRepository.save(statistics)
        }
    }
}
