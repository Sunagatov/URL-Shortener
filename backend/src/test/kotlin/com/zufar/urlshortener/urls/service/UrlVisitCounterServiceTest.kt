package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.urls.entity.UrlMapping
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.argThat
import org.mockito.kotlin.eq
import org.mockito.kotlin.verify
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update

@ExtendWith(MockitoExtension::class)
class UrlVisitCounterServiceTest {

    @Mock private lateinit var mongoTemplate: MongoTemplate

    @Test
    fun `incrementVisitCounters increments click counter for link clicks`() {
        service().incrementVisitCounters("abc12345", qrScan = false)

        verify(mongoTemplate).updateFirst(
            argThat<Query> { queryObject["_id"] == "abc12345" },
            argThat<Update> {
                updateObject["\$inc"].toString().contains("clickCount=1") &&
                    !updateObject["\$inc"].toString().contains("qrScanCount")
            },
            eq(UrlMapping::class.java)
        )
    }

    @Test
    fun `incrementVisitCounters increments QR counters for QR scans`() {
        service().incrementVisitCounters("abc12345", qrScan = true)

        verify(mongoTemplate).updateFirst(
            argThat<Query> { queryObject["_id"] == "abc12345" },
            argThat<Update> {
                updateObject["\$inc"].toString().contains("clickCount=1") &&
                    updateObject["\$inc"].toString().contains("qrScanCount=1") &&
                    updateObject["\$set"].toString().contains("lastQrScannedAt")
            },
            eq(UrlMapping::class.java)
        )
    }

    private fun service() = UrlVisitCounterService(mongoTemplate)
}
