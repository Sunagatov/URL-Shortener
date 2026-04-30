package com.zufar.urlshortener.urls.service.command

import com.zufar.urlshortener.urls.entity.UrlMapping
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Service

@Service
class TrackUrlClickService(
    private val mongoTemplate: MongoTemplate
) {

    fun increment(urlHash: String) {
        val query = Query.query(Criteria.where("_id").`is`(urlHash))
        val update = Update().inc("clickCount", 1)

        mongoTemplate.updateFirst(query, update, UrlMapping::class.java)
    }
}
