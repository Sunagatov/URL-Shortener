package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.entity.EventType
import com.zufar.urlshortener.analytics.entity.TrackUrlVisitCommand
import com.zufar.urlshortener.analytics.entity.UrlVisitEvent
import com.zufar.urlshortener.analytics.repository.UrlVisitEventRepository
import com.zufar.urlshortener.shared.security.PrivacyHasher
import com.zufar.urlshortener.urls.service.UrlVisitCounterService
import org.springframework.stereotype.Service
import java.net.URI

@Service
class UrlVisitEventWriter(
    private val repository: UrlVisitEventRepository,
    private val referrerClassifier: ReferrerClassifier,
    private val userAgentParser: UserAgentParserService,
    private val geoLookupService: GeoLookupService,
    private val botDetectionService: BotDetectionService,
    private val urlVisitCounterService: UrlVisitCounterService
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
            referrerRaw = sanitizeReferrer(command.referer),
            referrerDomain = referrer.domain,
            referrerCategory = referrer.category,
            countryCode = geo.countryCode,
            city = geo.city,
            deviceType = ua.deviceType,
            browser = ua.browser,
            browserVersionMajor = ua.browserVersionMajor,
            operatingSystem = ua.operatingSystem,
            operatingSystemVersionMajor = ua.operatingSystemVersionMajor,
            ipHash = PrivacyHasher.sha256(command.clientIp),
            userAgentHash = PrivacyHasher.sha256(command.userAgent),
            isBot = bot.isBot,
            botCategory = bot.category,
            sourceType = command.sourceType
        )

        repository.save(event)
        urlVisitCounterService.incrementVisitCounters(command.urlHash, command.eventType == EventType.QR_SCAN)
    }

    private fun sanitizeReferrer(value: String?): String? =
        value
            ?.takeIf(String::isNotBlank)
            ?.let {
                runCatching {
                    val uri = URI(it)
                    URI(uri.scheme, null, uri.host, uri.port, uri.path, null, null).toString()
                }.getOrNull()
            }
}
