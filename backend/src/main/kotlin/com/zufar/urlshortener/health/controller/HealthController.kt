package com.zufar.urlshortener.health.controller

import com.zufar.urlshortener.health.dto.HealthStatusResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

private const val HEALTHY_STATUS = "UP"

@RestController
@RequestMapping("/api/v1/health")
class HealthController {

    @GetMapping
    fun health(): ResponseEntity<HealthStatusResponse> =
        ResponseEntity.ok(
            HealthStatusResponse(
                status = HEALTHY_STATUS,
                timestamp = System.currentTimeMillis()
            )
        )
}
