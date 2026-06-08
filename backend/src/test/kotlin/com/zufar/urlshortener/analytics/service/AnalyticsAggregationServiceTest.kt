package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.entity.UrlVisitEvent
import org.bson.Document
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.whenever
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.aggregation.Aggregation
import org.springframework.data.mongodb.core.aggregation.AggregationResults
import org.springframework.data.mongodb.core.query.Query
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class AnalyticsAggregationServiceTest {

    @Mock private lateinit var mongoTemplate: MongoTemplate

    @Test
    fun `aggregateBreakdown calculates percentages against all matched events`() {
        whenever(mongoTemplate.count(any<Query>(), eq(UrlVisitEvent::class.java))).thenReturn(100)
        whenever(mongoTemplate.aggregate(any<Aggregation>(), eq("url_visit_events"), eq(Document::class.java)))
            .thenReturn(
                AggregationResults(
                    listOf(Document("_id", "US").append("count", 40)),
                    Document()
                )
            )

        val items = service().aggregateBreakdown(
            criteria = org.springframework.data.mongodb.core.query.Criteria.where("userId").`is`("user-123"),
            field = "countryCode",
            limit = 1
        )

        assertEquals(1, items.size)
        assertEquals("US", items.first().label)
        assertEquals(40, items.first().count)
        assertEquals(40.0, items.first().percentage)
    }

    private fun service() = AnalyticsAggregationService(mongoTemplate)
}
