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
        val range = resolveAnalyticsDateRange(from, to, timezone)
        return ResponseEntity.ok(
            queryService.summary(userId, range.from, range.to, range.timezone, includeBots, parseAnalyticsEventType(eventType))
        )
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
        val range = resolveAnalyticsDateRange(from, to, timezone)
        return ResponseEntity.ok(
            queryService.timeseries(userId, range.from, range.to, range.timezone, includeBots, parseAnalyticsEventType(eventType))
        )
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
        val range = resolveAnalyticsDateRange(from, to, "UTC")
        return ResponseEntity.ok(
            queryService.topLinks(userId, range.from, range.to, includeBots, validateAnalyticsLimit(limit), parseAnalyticsEventType(eventType))
        )
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
        val range = resolveAnalyticsDateRange(from, to, "UTC")
        return ResponseEntity.ok(
            queryService.breakdown(userId, range.from, range.to, dimension, includeBots, validateAnalyticsLimit(limit), parseAnalyticsEventType(eventType))
        )
    }

    @GetMapping("/export.csv", produces = ["text/csv"])
    fun exportCsv(
        @RequestParam(required = false) from: Instant?,
        @RequestParam(required = false) to: Instant?,
        @RequestParam(defaultValue = "false") includeBots: Boolean,
        @RequestParam(required = false) eventType: String?
    ): ResponseEntity<String> {
        val userId = authenticatedUserContext.requireAuthenticatedUserId()
        val range = resolveAnalyticsDateRange(from, to, "UTC")
        val csv = csvExportService.exportAccountEvents(userId, range.from, range.to, includeBots, parseAnalyticsEventType(eventType))
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"analytics-account.csv\"")
            .body(csv)
    }
}
