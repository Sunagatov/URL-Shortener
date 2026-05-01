package com.zufar.urlshortener.frontendlogs.controller

import com.zufar.urlshortener.frontendlogs.dto.FrontendLogRequest
import com.zufar.urlshortener.frontendlogs.service.FrontendLogIngestionService
import com.zufar.urlshortener.shared.web.ApplicationRoutes
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(ApplicationRoutes.FRONTEND_LOGS_BASE_PATH)
class FrontendLogController(
    private val frontendLogIngestionService: FrontendLogIngestionService
) {

    @PostMapping(
        consumes = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun ingest(
        @Valid @RequestBody request: FrontendLogRequest,
        httpServletRequest: HttpServletRequest
    ): ResponseEntity<Void> {
        frontendLogIngestionService.ingest(request, httpServletRequest)
        return ResponseEntity.accepted().build()
    }
}
