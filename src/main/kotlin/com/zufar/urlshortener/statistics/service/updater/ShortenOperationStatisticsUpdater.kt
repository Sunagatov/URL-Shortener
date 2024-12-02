package com.zufar.urlshortener.statistics.service.updater

import com.zufar.urlshortener.statistics.entity.UrlStatistics
import org.springframework.data.mongodb.core.MongoOperations
import org.springframework.data.mongodb.core.aggregation.Aggregation
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class ShortenOperationStatisticsUpdater(
    private val mongoOperations: MongoOperations
) {

    fun updateStatistics(
        userId: String,
        urlHash: String,
        shortenedUrl: String,
        originalUrl: String
    ) {
        val currentTime = Instant.now()

        val query = Query(Criteria.where("userId").`is`(userId))

        val urlStatistics = UrlStatistics(
            urlHash = urlHash,
            shortenedUrl = shortenedUrl,
            originalUrl = originalUrl,
            totalVisitsCount = 0
        )

        val update = Update()
            .inc("totalShortLinksCount", 1)
            .push("urlStatistics", urlStatistics)
            .set("modifiedDateTime", currentTime)

        val updateResult = mongoOperations.upsert(query, update, "statistics")

        if (updateResult.upsertedId != null) {
            val totalShortLinksCount = mongoOperations.aggregate(
                Aggregation.newAggregation(
                    Aggregation.match(Criteria.where("userId").`is`(userId)),
                    Aggregation.project("totalShortLinksCount")
                ),
                "statistics", Long::class.java
            ).first()

            val finalUpdate = Update()
                .set("totalShortLinksCount", totalShortLinksCount)
                .set("creationDateTime", currentTime)
                .set("modifiedDateTime", currentTime)

            mongoOperations.updateFirst(query, finalUpdate, "statistics")
        }
    }
}
