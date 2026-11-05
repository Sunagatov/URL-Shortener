package com.zufar.urlshortener.urls.service

import com.mongodb.ConnectionString
import com.mongodb.client.MongoClient
import com.mongodb.client.MongoClients
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.entity.UrlQuotaBucket
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.junit.jupiter.api.*
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.repository.support.MongoRepositoryFactory
import java.time.Instant
import java.util.UUID
import java.util.concurrent.Callable
import java.util.concurrent.Executors
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/** Run against a disposable loopback-only MongoDB, never the application's database. */
@EnabledIfEnvironmentVariable(named = "URL_SHORTENER_TEST_MONGO_URI", matches = ".+")
class MongoAbuseControlsIntegrationTest {
    private lateinit var client: MongoClient
    private lateinit var mongo: MongoTemplate
    private val now = Instant.parse("2026-11-05T23:59:00Z")

    @BeforeEach
    fun setup() {
        val connection = ConnectionString(System.getenv("URL_SHORTENER_TEST_MONGO_URI"))
        require(connection.hosts.all { it.startsWith("127.0.0.1:") } && connection.database == null)
        client = MongoClients.create(connection)
        mongo = MongoTemplate(client, "shortener_abuse_test_${UUID.randomUUID().toString().replace("-", "")}")
    }

    @AfterEach
    fun cleanup() {
        mongo.db.drop()
        client.close()
    }

    @Test
    fun `concurrent first bucket and existing bucket admissions never exceed allowance`() {
        val store = MongoUrlQuotaStore(mongo)
        val workers = Executors.newFixedThreadPool(16)
        try {
            val accepted = workers.invokeAll((1..100).map { Callable { store.tryReserve("global", 7, now) } })
                .count { it.get() }
            assertEquals(7, accepted)
            assertEquals(7, mongo.findById("global", UrlQuotaBucket::class.java)!!.admissions.size)
            assertFalse(MongoUrlQuotaStore(mongo).tryReserve("global", 7, now.plusSeconds(1)))
        } finally {
            workers.shutdownNow()
        }
    }

    @Test
    fun `midnight restart and link deletion do not refund rolling allowance`() {
        val store = MongoUrlQuotaStore(mongo)
        assertTrue(store.tryReserve("creator:one", 1, now))
        mongo.dropCollection("url_mappings")
        assertFalse(MongoUrlQuotaStore(mongo).tryReserve("creator:one", 1, now.plusSeconds(120)))
        assertTrue(store.tryReserve("creator:one", 1, now.plusSeconds(86401)))
        assertEquals(1, mongo.findById("creator:one", UrlQuotaBucket::class.java)!!.admissions.size)
    }

    @Test
    fun `destination updates preserve moderation warnings and do not resurrect disabled links`() {
        val repository = MongoRepositoryFactory(mongo).getRepository(UrlRepository::class.java)
        mongo.insert(mapping().copy(safetyInterstitialRequired = true, safetyInterstitialReason = "abuse_reported"))
        assertEquals(1L, repository.updateDestination("abc12345", "https://other.example/path", "other.example", false, null))
        val updated = repository.findById("abc12345").orElseThrow()
        assertEquals("https://other.example/path", updated.originalUrl)
        assertEquals(29, updated.clickCount)
        assertTrue(updated.safetyInterstitialRequired)
        assertEquals("abuse_reported", updated.safetyInterstitialReason)
        assertEquals(0L, repository.updateDestination("abc12345", "https://other.example/path", "other.example", false, null))

        mongo.save(updated.copy(disabled = true, disabledReason = "moderator"))
        assertEquals(0L, repository.updateDestination("abc12345", "https://bypass.example", "bypass.example", false, null))
        assertEquals(0L, repository.requireSafetyInterstitial("abc12345"))
        assertEquals("moderator", repository.findById("abc12345").orElseThrow().disabledReason)
    }

    @Test
    fun `ordinary destination changes can clear obsolete destination warnings`() {
        val repository = MongoRepositoryFactory(mongo).getRepository(UrlRepository::class.java)
        mongo.insert(mapping().copy(safetyInterstitialRequired = true, safetyInterstitialReason = "http_destination"))
        assertEquals(1L, repository.updateDestination("abc12345", "https://safe.example", "safe.example", false, null))
        assertFalse(repository.findById("abc12345").orElseThrow().safetyInterstitialRequired)
    }

    private fun mapping() = UrlMapping("abc12345", "https://zuf.uk/abc12345", "https://example.com",
        clickCount = 29, createdAt = now, expirationDate = now.plusSeconds(86400),
        requestIp = null, userAgent = null, userId = "owner")
}
