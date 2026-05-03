package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.analytics.entity.EventType
import com.zufar.urlshortener.analytics.entity.SourceType
import com.zufar.urlshortener.analytics.entity.TrackUrlVisitCommand
import com.zufar.urlshortener.analytics.service.TrackUrlVisitService
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.urls.api.UrlHashFormat
import com.zufar.urlshortener.urls.service.UrlManagementService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.CacheControl
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.net.URI
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.util.concurrent.TimeUnit

private const val REFERRER_POLICY_HEADER = "Referrer-Policy"
private const val REFERRER_POLICY_VALUE = "no-referrer"
private const val REFERER_HEADER = "Referer"

@RestController
@RequestMapping
class UrlRedirectController(
    private val urlManagementService: UrlManagementService,
    private val trackUrlVisitService: TrackUrlVisitService,
    private val clientIpResolver: ClientIpResolver,
    @Value("\${app.urls.redirect.max-cache-seconds:3600}") private val maxRedirectCacheSeconds: Long,
    private val clock: Clock
) {
    @GetMapping(UrlHashFormat.PATH_VARIABLE_REGEX)
    fun redirect(
        @PathVariable urlHash: String,
        @RequestParam(name = "qr", required = false) qr: String?,
        request: HttpServletRequest
    ): ResponseEntity<Unit> {
        val urlMapping = urlManagementService.getActiveUrlMapping(urlHash)
        val isQrScan = qr != null

        trackUrlVisitService.trackAsync(
            TrackUrlVisitCommand(
                urlHash = urlHash,
                userId = urlMapping.userId,
                occurredAt = clock.instant(),
                clientIp = clientIpResolver.resolve(request),
                referer = request.getHeader(REFERER_HEADER),
                userAgent = request.getHeader("User-Agent"),
                sourceType = if (isQrScan) SourceType.QR else SourceType.REDIRECT,
                eventType = if (isQrScan) EventType.QR_SCAN else EventType.LINK_CLICK
            )
        )

        return ResponseEntity.status(HttpStatus.FOUND)
            .cacheControl(buildCacheControl(urlMapping.expirationDate))
            .header(REFERRER_POLICY_HEADER, REFERRER_POLICY_VALUE)
            .location(URI(urlMapping.originalUrl))
            .build()
    }

    private fun buildCacheControl(expirationDate: Instant): CacheControl {
        val remainingLifetimeSeconds = Duration.between(Instant.now(clock), expirationDate).seconds

        if (remainingLifetimeSeconds <= 0) {
            return CacheControl.noStore()
        }

        return CacheControl.maxAge(remainingLifetimeSeconds.coerceAtMost(maxRedirectCacheSeconds), TimeUnit.SECONDS)
            .cachePublic()
            .noTransform()
    }
}
