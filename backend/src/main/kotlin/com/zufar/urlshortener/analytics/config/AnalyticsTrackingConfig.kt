package com.zufar.urlshortener.analytics.config

import jakarta.validation.constraints.Min
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import org.springframework.validation.annotation.Validated
import java.util.concurrent.ThreadPoolExecutor

@ConfigurationProperties(prefix = "app.analytics.tracking")
@Validated
data class AnalyticsTrackingProperties(
    @field:Min(1) val workers: Int = 2,
    @field:Min(0) val queueCapacity: Int = 100,
    @field:Min(1) val eventsPerMinute: Long = 60
)

@Configuration
@EnableConfigurationProperties(AnalyticsTrackingProperties::class)
class AnalyticsTrackingConfig {
    @Bean
    fun analyticsExecutor(properties: AnalyticsTrackingProperties) = ThreadPoolTaskExecutor().apply {
        corePoolSize = properties.workers
        maxPoolSize = properties.workers
        queueCapacity = properties.queueCapacity
        setThreadNamePrefix("url-analytics-")
        setRejectedExecutionHandler(ThreadPoolExecutor.AbortPolicy())
    }
}
