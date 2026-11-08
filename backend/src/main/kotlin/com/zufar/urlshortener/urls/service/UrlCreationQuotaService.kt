package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.security.PrivacyHasher
import com.zufar.urlshortener.urls.config.UrlProtectionProperties
import org.springframework.stereotype.Service
import io.micrometer.core.instrument.MeterRegistry
import java.time.Instant

@Service
class UrlCreationQuotaService(
    private val store: MongoUrlQuotaStore,
    private val properties: UrlProtectionProperties,
    private val registry: MeterRegistry
) {
    fun reserveCreation(creatorKey: String, userId: String?, host: String?, now: Instant) {
        val limit = if (userId == null) properties.anonymousDailyQuota else properties.authenticatedDailyQuota
        reserve("creator:${PrivacyHasher.sha256(creatorKey)}", limit, now, "URL_DAILY_QUOTA_EXCEEDED")
        reserveDestination(host, now)
    }

    fun reserveDestination(host: String?, now: Instant) {
        reserve("global", properties.globalDailyQuota, now, "URL_GLOBAL_QUOTA_EXCEEDED")
        if (host != null) {
            reserve("host:${PrivacyHasher.sha256(host)}", properties.destinationHostDailyQuota, now,
                "URL_DESTINATION_QUOTA_EXCEEDED")
        }
    }

    private fun reserve(key: String, limit: Long, now: Instant, code: String) {
        val scope = when {
            key == "global" -> "global"
            key.startsWith("host:") -> "destination"
            else -> "creator"
        }
        val allowed = try {
            store.tryReserve(key, limit, now)
        } catch (failure: ApplicationException) {
            registry.counter("url.quota.decisions", "scope", scope, "outcome", "unavailable").increment()
            throw failure
        }
        registry.counter("url.quota.decisions", "scope", scope, "outcome", if (allowed) "allowed" else "blocked").increment()
        if (!allowed) {
            throw ApplicationException.tooManyRequests(code, "Daily URL allowance exceeded. Please try again later.", 86400)
        }
    }
}
