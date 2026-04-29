package com.zufar.urlshortener.health.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health Check", description = "Application health monitoring")
class HealthController {

    @Operation(summary = "Check application health", description = "Returns application health status")
    @GetMapping
    fun health(): ResponseEntity<Map<String, String>> {
        return ResponseEntity.ok(mapOf(
            "status" to "UP",
            "timestamp" to System.currentTimeMillis().toString()
        ))
    }
}