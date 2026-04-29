package com.zufar.urlshortener.health.controller

import com.zufar.urlshortener.health.dto.HealthStatusResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

private const val HEALTHY_STATUS = "UP"

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health Check", description = "Application health monitoring")
class HealthController {

    @Operation(summary = "Check application health", description = "Returns application health status")
    @GetMapping
    fun health(): ResponseEntity<HealthStatusResponse> =
        ResponseEntity.ok(
            HealthStatusResponse(
                status = HEALTHY_STATUS,
                timestamp = System.currentTimeMillis()
            )
        )
}
