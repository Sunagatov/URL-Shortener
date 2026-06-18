package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.urls.entity.UrlCreationBurstBucket
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.aggregation.Aggregation
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.temporal.ChronoUnit

@Service
class MongoCreationBurstGuard(
    private val mongoTemplate: MongoTemplate
) : CreationBurstGuard {

    override fun recordAndCount(creatorKey: String, now: Instant, windowSeconds: Long): Long {
        val bucketSecond = now.truncatedTo(ChronoUnit.SECONDS)
        val bucketId = "$creatorKey:${bucketSecond.epochSecond}"
        val expiresAt = bucketSecond.plusSeconds(windowSeconds + BUCKET_RETENTION_SECONDS)

        val query = Query.query(Criteria.where("_id").`is`(bucketId))
        val update = Update()
            .inc("count", 1)
            .set("expiresAt", expiresAt)
            .setOnInsert("creatorKey", creatorKey)
            .setOnInsert("bucketSecond", bucketSecond)

        mongoTemplate.upsert(query, update, UrlCreationBurstBucket::class.java)

        val cutoff = bucketSecond.minusSeconds(windowSeconds - 1)
        val aggregation = Aggregation.newAggregation(
            Aggregation.match(
                Criteria.where("creatorKey").`is`(creatorKey)
                    .and("bucketSecond").gte(cutoff)
            ),
            Aggregation.group().sum("count").`as`("total")
        )

        return mongoTemplate.aggregate(
            aggregation,
            UrlCreationBurstBucket::class.java,
            BurstWindowTotal::class.java
        ).uniqueMappedResult?.total ?: 0
    }

    companion object {
        private const val BUCKET_RETENTION_SECONDS = 60L
    }
}

data class BurstWindowTotal(
    val total: Long = 0
)
