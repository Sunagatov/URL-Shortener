package com.zufar.urlshortener.analytics.controller

import com.zufar.urlshortener.analytics.dto.AnalyticsBreakdownResponse
import com.zufar.urlshortener.analytics.dto.AnalyticsSummaryResponse
import com.zufar.urlshortener.analytics.dto.AnalyticsTimeseriesResponse
import com.zufar.urlshortener.analytics.service.AnalyticsCsvExportService
import com.zufar.urlshortener.analytics.service.UrlAnalyticsQueryService
import com.zufar.urlshortener.urls.service.UrlManagementService
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.Instant

private const val ACCESS_DENIED_MESSAGE = "You are not allowed to access analytics for this URL"

@RestController
@RequestMapping("/api/v1/urls/{urlHash}/analytics", produces = [MediaType.APPLICATION_JSON_VALUE])
class UrlAnalyticsController(
    private val queryService: UrlAnalyticsQueryService,
    private val csvExportService: AnalyticsCsvExportService,
    private val urlManagementService: UrlManagementService
) {

    @GetMapping("/summary")
    fun summary(
        @PathVariable urlHash: String,
        @RequestParam(required = false) from: Instant?,
        @RequestParam(required = false) to: Instant?,
        @RequestParam(defaultValue = "UTC") timezone: String,
        @RequestParam(defaultValue = "false") includeBots: Boolean,
        @RequestParam(required = false) eventType: String?
    ): ResponseEntity<AnalyticsSummaryResponse> {
        urlManagementService.getOwnedActiveUrlMapping(urlHash, ACCESS_DENIED_MESSAGE)
        val range = resolveAnalyticsDateRange(from, to, timezone)
        return ResponseEntity.ok(
            queryService.summary(urlHash, range.from, range.to, range.timezone, includeBots, parseAnalyticsEventType(eventType))
        )
    }

    @GetMapping("/timeseries")
    fun timeseries(
        @PathVariable urlHash: String,
        @RequestParam(required = false) from: Instant?,
        @RequestParam(required = false) to: Instant?,
        @RequestParam(defaultValue = "UTC") timezone: String,
        @RequestParam(defaultValue = "false") includeBots: Boolean,
        @RequestParam(required = false) eventType: String?
    ): ResponseEntity<AnalyticsTimeseriesResponse> {
        urlManagementService.getOwnedActiveUrlMapping(urlHash, ACCESS_DENIED_MESSAGE)
        val range = resolveAnalyticsDateRange(from, to, timezone)
        return ResponseEntity.ok(
            queryService.timeseries(urlHash, range.from, range.to, range.timezone, includeBots, parseAnalyticsEventType(eventType))
        )
    }

    @GetMapping("/{dimension:referrers|locations|devices|browsers|operating-systems}")
    fun breakdown(
        @PathVariable urlHash: String,
        @PathVariable dimension: String,
        @RequestParam(required = false) from: Instant?,
        @RequestParam(required = false) to: Instant?,
        @RequestParam(defaultValue = "false") includeBots: Boolean,
        @RequestParam(defaultValue = "10") limit: Int,
        @RequestParam(required = false) eventType: String?
    ): ResponseEntity<AnalyticsBreakdownResponse> {
        urlManagementService.getOwnedActiveUrlMapping(urlHash, ACCESS_DENIED_MESSAGE)
        val range = resolveAnalyticsDateRange(from, to, "UTC")
        return ResponseEntity.ok(
            queryService.breakdown(urlHash, range.from, range.to, dimension, includeBots, validateAnalyticsLimit(limit), parseAnalyticsEventType(eventType))
        )
    }

    @GetMapping("/export.csv", produces = ["text/csv"])
    fun exportCsv(
        @PathVariable urlHash: String,
        @RequestParam(required = false) from: Instant?,
        @RequestParam(required = false) to: Instant?,
        @RequestParam(defaultValue = "false") includeBots: Boolean,
        @RequestParam(required = false) eventType: String?
    ): ResponseEntity<String> {
        urlManagementService.getOwnedActiveUrlMapping(urlHash, ACCESS_DENIED_MESSAGE)
        val range = resolveAnalyticsDateRange(from, to, "UTC")
        val csv = csvExportService.exportUrlEvents(urlHash, range.from, range.to, includeBots, parseAnalyticsEventType(eventType))
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"analytics-$urlHash.csv\"")
            .body(csv)
    }
}
