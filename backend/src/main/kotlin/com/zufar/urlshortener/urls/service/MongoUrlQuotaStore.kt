package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.urls.entity.UrlQuotaBucket
import org.bson.Document
import org.springframework.dao.DataAccessException
import org.springframework.dao.DuplicateKeyException
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.aggregation.AggregationOperation
import org.springframework.data.mongodb.core.aggregation.AggregationUpdate
import org.springframework.data.mongodb.core.query.BasicQuery
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Date

@Service
class MongoUrlQuotaStore(private val mongoTemplate: MongoTemplate) {
    fun tryReserve(key: String, limit: Long, now: Instant): Boolean {
        if (limit <= 0) return false
        // Each document is bounded by its allowance. Pruning and admission happen
        // in one MongoDB operation, preserving the rolling 24-hour window.
        val recent = Document("\$filter", Document("input", Document("\$ifNull", listOf("\$admissions", emptyList<Any>())))
            .append("as", "admission")
            .append("cond", Document("\$gt", listOf("\$\$admission", Date.from(now.minus(1, ChronoUnit.DAYS))))))
        val query = BasicQuery(Document("_id", key)
            .append("\$expr", Document("\$lt", listOf(Document("\$size", recent), limit))))
        val update = AggregationUpdate.from(listOf(AggregationOperation {
            Document("\$set", Document("admissions", Document("\$concatArrays", listOf(recent, listOf(Date.from(now)))))
                .append("expiresAt", Date.from(now.plus(25, ChronoUnit.HOURS))))
        }))
        return try {
            val options = FindAndModifyOptions.options().returnNew(true)
            if (mongoTemplate.findAndModify(query, update, options, UrlQuotaBucket::class.java) != null) {
                true
            } else {
                try {
                    mongoTemplate.insert(UrlQuotaBucket(key, listOf(now), now.plus(25, ChronoUnit.HOURS)))
                    true
                } catch (_: DuplicateKeyException) {
                    // A full bucket or another request's first admission. Retry
                    // the guarded update; never reset or overwrite its history.
                    mongoTemplate.findAndModify(query, update, options, UrlQuotaBucket::class.java) != null
                }
            }
        } catch (_: DataAccessException) {
            throw ApplicationException(HttpStatus.SERVICE_UNAVAILABLE, "URL_QUOTA_UNAVAILABLE",
                "URL creation is temporarily unavailable. Please try again later.", 30)
        }
    }
}
