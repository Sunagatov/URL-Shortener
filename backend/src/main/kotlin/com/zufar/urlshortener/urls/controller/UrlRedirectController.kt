package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.urls.api.UrlHashFormat
import com.zufar.urlshortener.urls.service.UrlManagementService
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.CacheControl
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Clock
import java.net.URI
import java.time.Duration
import java.time.LocalDateTime
import java.util.concurrent.TimeUnit

private const val REFERRER_POLICY_HEADER = "Referrer-Policy"
private const val REFERRER_POLICY_VALUE = "no-referrer"

@RestController
@RequestMapping
class UrlRedirectController(
    private val urlManagementService: UrlManagementService,
    @Value($$"${app.urls.redirect.max-cache-seconds:3600}") private val maxRedirectCacheSeconds: Long,
    private val clock: Clock
) {
    @GetMapping(UrlHashFormat.PATH_VARIABLE_REGEX)
    fun redirect(@PathVariable urlHash: String): ResponseEntity<Unit> {
        val urlMapping = urlManagementService.getPublicUrlMapping(urlHash)
        urlManagementService.incrementClickCount(urlHash)
        return ResponseEntity.status(HttpStatus.FOUND)
            .cacheControl(buildCacheControl(urlMapping.expirationDate))
            .header(REFERRER_POLICY_HEADER, REFERRER_POLICY_VALUE)
            .location(URI(urlMapping.originalUrl))
            .build()
    }

    private fun buildCacheControl(expirationDate: LocalDateTime): CacheControl {
        val remainingLifetimeSeconds = Duration.between(LocalDateTime.now(clock), expirationDate).seconds

        if (remainingLifetimeSeconds <= 0) {
            return CacheControl.noStore()
        }

        return CacheControl.maxAge(remainingLifetimeSeconds.coerceAtMost(maxRedirectCacheSeconds), TimeUnit.SECONDS)
            .cachePublic()
            .noTransform()
    }
}
