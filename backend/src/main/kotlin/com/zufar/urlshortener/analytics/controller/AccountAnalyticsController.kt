package com.zufar.urlshortener.analytics.controller

import com.zufar.urlshortener.analytics.dto.AnalyticsBreakdownResponse
import com.zufar.urlshortener.analytics.dto.AnalyticsSummaryResponse
import com.zufar.urlshortener.analytics.dto.AnalyticsTimeseriesResponse
import com.zufar.urlshortener.analytics.dto.AnalyticsTopLinksResponse
import com.zufar.urlshortener.analytics.service.AccountAnalyticsQueryService
import com.zufar.urlshortener.analytics.service.AnalyticsCsvExportService
import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.time.temporal.ChronoUnit

@RestController
@RequestMapping("/api/v1/analytics", produces = [MediaType.APPLICATION_JSON_VALUE])
class AccountAnalyticsController(
    private val queryService: AccountAnalyticsQueryService,
    private val csvExportService: AnalyticsCsvExportService,
    private val authenticatedUserContext: AuthenticatedUserContextService
) {

    @GetMapping("/summary")
    fun summary(
        @RequestParam(required = false) from: Instant?,
        @RequestParam(required = false) to: Instant?,
        @RequestParam(defaultValue = "UTC") timezone: String,
        @RequestParam(defaultValue = "false") includeBots: Boolean,
        @RequestParam(required = false) eventType: String?
    ): ResponseEntity<AnalyticsSummaryResponse> {
        val userId = authenticatedUserContext.requireAuthenticatedUserId()
        val (resolvedFrom, resolvedTo) = resolveRange(from, to)
        return ResponseEntity.ok(queryService.summary(userId, resolvedFrom, resolvedTo, timezone, includeBots, eventType))
    }

    @GetMapping("/timeseries")
    fun timeseries(
        @RequestParam(required = false) from: Instant?,
        @RequestParam(required = false) to: Instant?,
        @RequestParam(defaultValue = "UTC") timezone: String,
        @RequestParam(defaultValue = "false") includeBots: Boolean,
        @RequestParam(required = false) eventType: String?
    ): ResponseEntity<AnalyticsTimeseriesResponse> {
        val userId = authenticatedUserContext.requireAuthenticatedUserId()
        val (resolvedFrom, resolvedTo) = resolveRange(from, to)
        return ResponseEntity.ok(queryService.timeseries(userId, resolvedFrom, resolvedTo, timezone, includeBots, eventType))
    }

    @GetMapping("/top-links")
    fun topLinks(
        @RequestParam(required = false) from: Instant?,
        @RequestParam(required = false) to: Instant?,
        @RequestParam(defaultValue = "false") includeBots: Boolean,
        @RequestParam(defaultValue = "10") limit: Int,
        @RequestParam(required = false) eventType: String?
    ): ResponseEntity<AnalyticsTopLinksResponse> {
        val userId = authenticatedUserContext.requireAuthenticatedUserId()
        val (resolvedFrom, resolvedTo) = resolveRange(from, to)
        return ResponseEntity.ok(queryService.topLinks(userId, resolvedFrom, resolvedTo, includeBots, limit, eventType))
    }

    @GetMapping("/{dimension:referrers|locations|devices|browsers|operating-systems}")
    fun breakdown(
        @PathVariable dimension: String,
        @RequestParam(required = false) from: Instant?,
        @RequestParam(required = false) to: Instant?,
        @RequestParam(defaultValue = "false") includeBots: Boolean,
        @RequestParam(defaultValue = "10") limit: Int,
        @RequestParam(required = false) eventType: String?
    ): ResponseEntity<AnalyticsBreakdownResponse> {
        val userId = authenticatedUserContext.requireAuthenticatedUserId()
        val (resolvedFrom, resolvedTo) = resolveRange(from, to)
        return ResponseEntity.ok(queryService.breakdown(userId, resolvedFrom, resolvedTo, dimension, includeBots, limit, eventType))
    }

    @GetMapping("/export.csv", produces = ["text/csv"])
    fun exportCsv(
        @RequestParam(required = false) from: Instant?,
        @RequestParam(required = false) to: Instant?,
        @RequestParam(defaultValue = "false") includeBots: Boolean,
        @RequestParam(required = false) eventType: String?
    ): ResponseEntity<String> {
        val userId = authenticatedUserContext.requireAuthenticatedUserId()
        val (resolvedFrom, resolvedTo) = resolveRange(from, to)
        val csv = csvExportService.exportAccountEvents(userId, resolvedFrom, resolvedTo, includeBots, eventType)
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"analytics-account.csv\"")
            .body(csv)
    }

    private fun resolveRange(from: Instant?, to: Instant?): Pair<Instant, Instant> {
        val resolvedTo = to ?: Instant.now()
        val resolvedFrom = from ?: resolvedTo.minus(7, ChronoUnit.DAYS)
        return resolvedFrom to resolvedTo
    }
}
