package com.zufar.urlshortener.statistics.service.updater

import com.zufar.urlshortener.shorten.repository.UrlRepository
import com.zufar.urlshortener.statistics.entity.UrlStatistics
import org.springframework.data.mongodb.core.MongoOperations
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Service

@Service
class ShortenOperationStatisticsUpdater(
    private val mongoOperations: MongoOperations,
    private val urlRepository: UrlRepository
) {

    fun updateStatistics(
        userId: String,
        urlHash: String,
        shortenedUrl: String,
        originalUrl: String
    ) {
        val query = Query(Criteria.where("userId").`is`(userId))
        val urlStatistics = UrlStatistics(
            urlHash = urlHash,
            shortenedUrl = shortenedUrl,
            originalUrl = originalUrl,
            totalVisitsCount = 0
        )

        // Use upsert to atomically insert or update the document
        val update = Update()
            .inc("totalShortLinksCount", 1)
            .push("urlStatistics", urlStatistics)

        val updateResult = mongoOperations.upsert(query, update, "statistics")

        // If the document didn't exist and was inserted, we need to ensure totalShortLinksCount is accurate
        if (updateResult.upsertedId != null) {
            // Document was inserted; recalculate totalShortLinksCount
            val totalShortLinksCount = urlRepository.countByUserId(userId)
            mongoOperations.updateFirst(
                query,
                Update().set("totalShortLinksCount", totalShortLinksCount),
                "statistics"
            )
        }
    }
}
