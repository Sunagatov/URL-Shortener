package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.shared.config.RateLimitConfig
import com.zufar.urlshortener.shared.config.RateLimitProperties
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.security.AuditLogService
import com.zufar.urlshortener.analytics.service.BotDetectionService
import com.zufar.urlshortener.analytics.service.UserAgentParserService
import com.zufar.urlshortener.urls.config.UrlProtectionProperties
import com.zufar.urlshortener.urls.repository.UrlRepository
import java.time.Instant
import org.mockito.kotlin.mock

fun testUrlCreationProtectionService(urlRepository: UrlRepository, creationQuota: UrlCreationQuotaService = mock()): UrlCreationProtectionService =
    UrlCreationProtectionService(
        creationQuota = creationQuota,
        clientIpResolver = ClientIpResolver(RateLimitConfig(RateLimitProperties())),
        protectionProperties = UrlProtectionProperties(),
        auditLogService = AuditLogService(),
        userAgentParser = UserAgentParserService(),
        botDetectionService = BotDetectionService(),
        creationBurstGuard = InMemoryTestCreationBurstGuard()
    )

fun testAuditLogService(): AuditLogService = AuditLogService()

class InMemoryTestCreationBurstGuard : CreationBurstGuard {
    private val buckets = mutableMapOf<String, ArrayDeque<Instant>>()

    override fun recordAndCount(creatorKey: String, now: Instant, windowSeconds: Long): Long {
        val cutoff = now.minusSeconds(windowSeconds)
        val bucket = buckets.getOrPut(creatorKey) { ArrayDeque() }
        while (bucket.isNotEmpty() && bucket.first() < cutoff) {
            bucket.removeFirst()
        }
        bucket.addLast(now)
        return bucket.size.toLong()
    }
}
