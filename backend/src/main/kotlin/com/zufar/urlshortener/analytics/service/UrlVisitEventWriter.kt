package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.entity.EventType
import com.zufar.urlshortener.analytics.entity.TrackUrlVisitCommand
import com.zufar.urlshortener.analytics.entity.UrlVisitEvent
import com.zufar.urlshortener.analytics.repository.UrlVisitEventRepository
import com.zufar.urlshortener.urls.entity.UrlMapping
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Service
import java.security.MessageDigest

@Service
class UrlVisitEventWriter(
    private val repository: UrlVisitEventRepository,
    private val referrerClassifier: ReferrerClassifier,
    private val userAgentParser: UserAgentParserService,
    private val geoLookupService: GeoLookupService,
    private val botDetectionService: BotDetectionService,
    private val mongoTemplate: MongoTemplate
) {

    fun enrichAndPersist(command: TrackUrlVisitCommand) {
        val referrer = referrerClassifier.classify(command.referer)
        val ua = userAgentParser.parse(command.userAgent)
        val geo = geoLookupService.lookup(command.clientIp)
        val bot = botDetectionService.detect(command.userAgent, ua.deviceType)

        val event = UrlVisitEvent(
            urlHash = command.urlHash,
            userId = command.userId,
            eventType = command.eventType,
            occurredAt = command.occurredAt,
            referrerRaw = command.referer,
            referrerDomain = referrer.domain,
            referrerCategory = referrer.category,
            countryCode = geo.countryCode,
            city = geo.city,
            deviceType = if (bot.isBot) ua.deviceType else ua.deviceType,
            browser = ua.browser,
            browserVersionMajor = ua.browserVersionMajor,
            operatingSystem = ua.operatingSystem,
            operatingSystemVersionMajor = ua.operatingSystemVersionMajor,
            ipHash = sha256(command.clientIp),
            userAgentHash = sha256(command.userAgent),
            isBot = bot.isBot,
            botCategory = bot.category,
            sourceType = command.sourceType
        )

        repository.save(event)
        updateCounters(command.urlHash, command.eventType)
    }

    private fun updateCounters(urlHash: String, eventType: EventType) {
        val query = Query.query(Criteria.where("_id").`is`(urlHash))
        val update = Update().inc("clickCount", 1)
        if (eventType == EventType.QR_SCAN) {
            update.inc("qrScanCount", 1)
            update.set("lastQrScannedAt", java.time.Instant.now())
        }
        mongoTemplate.updateFirst(query, update, UrlMapping::class.java)
    }

    private fun sha256(value: String?): String? {
        if (value.isNullOrBlank()) return null
        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(value.toByteArray()).joinToString("") { "%02x".format(it) }
    }
}
