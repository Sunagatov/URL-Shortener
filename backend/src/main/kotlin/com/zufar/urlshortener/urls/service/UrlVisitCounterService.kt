package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.urls.entity.UrlMapping
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class UrlVisitCounterService(
    private val mongoTemplate: MongoTemplate
) {

    fun incrementVisitCounters(urlHash: String, qrScan: Boolean) {
        val query = Query.query(Criteria.where("_id").`is`(urlHash))
        val update = Update().inc("clickCount", 1)
        if (qrScan) {
            update.inc("qrScanCount", 1)
            update.set("lastQrScannedAt", Instant.now())
        }
        mongoTemplate.updateFirst(query, update, UrlMapping::class.java)
    }
}
