package com.zufar.urlshortener.health.controller

import com.zufar.urlshortener.health.dto.HealthStatusResponse
import com.zufar.urlshortener.shared.web.ApplicationRoutes
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

private const val HEALTHY_STATUS = "UP"

@RestController
@RequestMapping(ApplicationRoutes.HEALTH_BASE_PATH)
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
