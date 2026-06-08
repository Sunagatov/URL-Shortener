package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.urls.api.UrlHashFormat
import com.zufar.urlshortener.urls.service.UrlManagementService
import com.zufar.urlshortener.urls.service.UrlVisitEventType
import com.zufar.urlshortener.urls.service.UrlVisitSourceType
import com.zufar.urlshortener.urls.service.UrlVisitTracker
import com.zufar.urlshortener.urls.service.UrlVisitTrackingCommand
import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.CacheControl
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
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
private const val CONTINUE_PARAM = "continue"

@RestController
@RequestMapping
class UrlRedirectController(
    private val urlManagementService: UrlManagementService,
    private val urlVisitTracker: UrlVisitTracker,
    private val clientIpResolver: ClientIpResolver,
    @Value("\${app.urls.redirect.max-cache-seconds:3600}") private val maxRedirectCacheSeconds: Long,
    private val clock: Clock
) {
    @GetMapping(UrlHashFormat.PATH_VARIABLE_REGEX)
    fun redirect(
        @PathVariable urlHash: String,
        @RequestParam(name = "qr", required = false) qr: String?,
        @RequestParam(name = CONTINUE_PARAM, required = false) continueRedirect: String?,
        request: HttpServletRequest
    ): ResponseEntity<*> {
        val urlMapping = urlManagementService.getActiveUrlMapping(urlHash)
        val isQrScan = qr != null
        urlManagementService.ensureSafeRedirectDestination(urlMapping)

        if (urlMapping.safetyInterstitialRequired && continueRedirect != "1") {
            return safetyInterstitial(urlHash, urlMapping.originalUrl, isQrScan)
        }

        urlVisitTracker.track(
            UrlVisitTrackingCommand(
                urlHash = urlHash,
                userId = urlMapping.userId,
                occurredAt = clock.instant(),
                clientIp = clientIpResolver.resolve(request),
                referer = request.getHeader(REFERER_HEADER),
                userAgent = request.getHeader("User-Agent"),
                sourceType = if (isQrScan) UrlVisitSourceType.QR else UrlVisitSourceType.REDIRECT,
                eventType = if (isQrScan) UrlVisitEventType.QR_SCAN else UrlVisitEventType.LINK_CLICK
            )
        )

        return ResponseEntity.status(HttpStatus.FOUND)
            .cacheControl(buildCacheControl(urlMapping.expirationDate))
            .header(REFERRER_POLICY_HEADER, REFERRER_POLICY_VALUE)
            .location(URI(urlMapping.originalUrl))
            .build<Unit>()
    }

    private fun safetyInterstitial(urlHash: String, destinationUrl: String, qr: Boolean): ResponseEntity<String> {
        val continuePath = buildString {
            append("/")
            append(escapeAttribute(urlHash))
            append("?")
            append(CONTINUE_PARAM)
            append("=1")
            if (qr) {
                append("&qr=1")
            }
        }

        return ResponseEntity.ok()
            .contentType(MediaType.TEXT_HTML)
            .cacheControl(CacheControl.noStore())
            .header(REFERRER_POLICY_HEADER, REFERRER_POLICY_VALUE)
            .header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")
            .body(
                """
                <!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Continue to external site</title>
                  <style>
                    body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0f172a;color:#e5e7eb;display:grid;min-height:100vh;place-items:center;margin:0;padding:24px}
                    main{max-width:560px;border:1px solid #334155;border-radius:16px;background:#111827;padding:28px}
                    a{display:inline-block;margin-top:18px;border-radius:10px;background:#2563eb;color:white;padding:10px 14px;text-decoration:none;font-weight:700}
                    p{color:#cbd5e1;line-height:1.5;word-break:break-word}
                  </style>
                </head>
                <body>
                  <main>
                    <h1>Continue to external site?</h1>
                    <p>This short link points to:</p>
                    <p><strong>${escapeHtml(destinationUrl)}</strong></p>
                    <a href="$continuePath" rel="nofollow">Continue</a>
                  </main>
                </body>
                </html>
                """.trimIndent()
            )
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

    private fun escapeHtml(value: String): String =
        value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;")

    private fun escapeAttribute(value: String): String =
        value.replace(Regex("[^a-zA-Z0-9_-]"), "")
}
