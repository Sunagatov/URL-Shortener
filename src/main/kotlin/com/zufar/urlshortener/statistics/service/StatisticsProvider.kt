package com.zufar.urlshortener.statistics.service

import com.zufar.urlshortener.shorten.service.UserDetailsProvider
import com.zufar.urlshortener.statistics.dto.UserStatisticsDto
import com.zufar.urlshortener.statistics.dto.UrlStatisticsDto
import com.zufar.urlshortener.statistics.entity.Statistics
import com.zufar.urlshortener.statistics.repository.StatisticsRepository
import org.springframework.stereotype.Service

@Service
class StatisticsProvider(
    private val statisticsRepository: StatisticsRepository,
    private val userDetailsProvider: UserDetailsProvider
) {

    fun get(): UserStatisticsDto {
        val user = userDetailsProvider.getUserEntity()
        val userId = user.id
        val statistics = statisticsRepository.findByUserId(userId)

        return if (statistics != null) {
            toStatisticsDto(statistics)
        } else {
            getDefaultStatisticsDto()
        }
    }

    private fun getDefaultStatisticsDto(): UserStatisticsDto {
        return UserStatisticsDto(
            totalShortLinksCount = 0,
            totalVisitsCount = 0,
            urlStatistics = emptyList()
        )
    }

    private fun toStatisticsDto(statistics: Statistics): UserStatisticsDto {
        val userStatisticsDto = UserStatisticsDto(
            totalShortLinksCount = statistics.totalShortLinksCount,
            totalVisitsCount = statistics.totalVisitsCount,
            urlStatistics = statistics.urlStatistics.map { urlStat ->
                UrlStatisticsDto(
                    shortenedUrl = urlStat.shortenedUrl,
                    originalUrl = urlStat.originalUrl,
                    totalVisitsCount = urlStat.totalVisitsCount,
                )
            }
        )
        return userStatisticsDto
    }
}
