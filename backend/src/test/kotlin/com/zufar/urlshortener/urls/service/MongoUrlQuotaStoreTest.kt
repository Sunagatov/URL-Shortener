package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.urls.entity.UrlQuotaBucket
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.dao.DataAccessResourceFailureException
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.aggregation.AggregationUpdate
import org.springframework.data.mongodb.core.query.Query
import org.springframework.http.HttpStatus
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertFalse

class MongoUrlQuotaStoreTest {
    private val mongo: MongoTemplate = mock()

    @Test
    fun `database failure refuses new work with temporary unavailable status`() {
        whenever(mongo.findAndModify(any<Query>(), any<AggregationUpdate>(), any<FindAndModifyOptions>(), eq(UrlQuotaBucket::class.java)))
            .thenThrow(DataAccessResourceFailureException("offline"))
        val error = assertThrows<ApplicationException> { MongoUrlQuotaStore(mongo).tryReserve("global", 1, Instant.now()) }
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.status)
        assertEquals("URL_QUOTA_UNAVAILABLE", error.code)
    }

    @Test
    fun `zero global allowance stops admissions without database work`() {
        assertFalse(MongoUrlQuotaStore(mongo).tryReserve("global", 0, Instant.now()))
        verifyNoInteractions(mongo)
    }
}
