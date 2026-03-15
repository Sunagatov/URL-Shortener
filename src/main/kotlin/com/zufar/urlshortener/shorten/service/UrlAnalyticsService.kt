package com.zufar.urlshortener.shorten.service

import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.MeterRegistry
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Service

@Service
class UrlAnalyticsService(meterRegistry: MeterRegistry) {
    
    private val urlClickCounter = Counter.builder("url.clicks")
        .description("Number of URL clicks")
        .register(meterRegistry)
    
    fun recordClick(urlHash: String, request: HttpServletRequest) {
        urlClickCounter.increment()
    }
}