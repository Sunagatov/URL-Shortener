package com.zufar.urlshortener.moderation.controller

import com.zufar.urlshortener.moderation.dto.AbuseReportRequest
import com.zufar.urlshortener.moderation.dto.AbuseReportResponse
import com.zufar.urlshortener.moderation.service.ModerationService
import com.zufar.urlshortener.shared.web.ApplicationRoutes
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(ApplicationRoutes.ABUSE_REPORTS_BASE_PATH)
class AbuseReportController(
    private val moderationService: ModerationService
) {
    @PostMapping(consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun reportAbuse(
        @Valid @RequestBody request: AbuseReportRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<AbuseReportResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(moderationService.reportAbuse(request, httpRequest))
}
