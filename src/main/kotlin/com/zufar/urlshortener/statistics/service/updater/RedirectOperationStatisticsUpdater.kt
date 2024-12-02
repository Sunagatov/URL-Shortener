package com.zufar.urlshortener.statistics.service.updater

import com.zufar.urlshortener.shorten.repository.UrlRepository
import com.zufar.urlshortener.statistics.entity.Statistics
import com.zufar.urlshortener.statistics.entity.UrlStatistics
import org.springframework.data.mongodb.core.MongoOperations
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class RedirectOperationStatisticsUpdater(
    private val mongoOperations: MongoOperations,
    private val urlRepository: UrlRepository
) {

    fun updateStatistics(
        userId: String,
        urlHash: String,
        shortenedUrl: String,
        originalUrl: String
    ) {
        val now = LocalDateTime.now()

        val query = Query(Criteria.where("userId").`is`(userId))

        val update = Update()
            .inc("totalVisitsCount", 1)
            .set("modifiedDateTime", now)

        val updateResult = mongoOperations.upsert(query, update, Statistics::class.java)

        if (updateResult.upsertedId != null) {
            val initialStatistics = Statistics(
                userId = userId,
                totalShortLinksCount = urlRepository.countByUserId(userId),
                totalVisitsCount = 1,
                createdAt = now,
                updatedAt = now,
                urlStatistics = listOf(
                    UrlStatistics(urlHash = urlHash, shortenedUrl = shortenedUrl, originalUrl = originalUrl, totalVisitsCount = 1)
                )
            )
            mongoOperations.save(initialStatistics)
        } else {
            val urlStat = mongoOperations.findOne(query, Statistics::class.java)?.urlStatistics?.find {
                it.urlHash == urlHash
            }
            if (urlStat != null) {
                val urlUpdate = Update().inc("urlStatistics.$[elem].totalVisitsCount", 1)
                    .filterArray(Criteria.where("elem.urlHash").`is`(urlHash))
                    .set("modifiedDateTime", now)

                mongoOperations.updateFirst(query, urlUpdate, Statistics::class.java)
            } else {
                val addUrlStat = Update().push("urlStatistics", UrlStatistics(urlHash = urlHash, shortenedUrl = shortenedUrl, originalUrl = originalUrl, totalVisitsCount = 1))
                    .set("modifiedDateTime", now)

                mongoOperations.updateFirst(query, addUrlStat, Statistics::class.java)
            }
        }
    }
}
