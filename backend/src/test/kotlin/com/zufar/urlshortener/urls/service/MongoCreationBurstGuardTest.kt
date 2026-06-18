package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.urls.entity.UrlCreationBurstBucket
import org.bson.Document
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.eq
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.aggregation.AggregationResults
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import java.time.Instant
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class MongoCreationBurstGuardTest {

    @Mock private lateinit var mongoTemplate: MongoTemplate

    @Test
    fun `recordAndCount increments the current bucket and sums recent buckets`() {
        whenever(
            mongoTemplate.aggregate(
                any<org.springframework.data.mongodb.core.aggregation.Aggregation>(),
                eq(UrlCreationBurstBucket::class.java),
                eq(BurstWindowTotal::class.java)
            )
        ).thenReturn(
            AggregationResults(listOf(BurstWindowTotal(4)), Document("ok", 1))
        )

        val result = service().recordAndCount("user:user-123", Instant.parse("2024-01-01T10:15:35Z"), 10)

        assertEquals(4, result)
        verify(mongoTemplate).upsert(
            argThat<Query> { queryObject["_id"] == "user:user-123:1704104135" },
            argThat<Update> {
                updateObject["\$inc"] != null &&
                    updateObject["\$setOnInsert"] != null &&
                    updateObject["\$set"] != null
            },
            eq(UrlCreationBurstBucket::class.java)
        )
    }

    private fun service() = MongoCreationBurstGuard(mongoTemplate)
}
