package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.urls.service.UrlVisitTracker
import com.zufar.urlshortener.urls.service.UrlVisitTrackingCommand
import org.slf4j.LoggerFactory
import com.zufar.urlshortener.analytics.config.AnalyticsTrackingProperties
import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import io.micrometer.core.instrument.MeterRegistry
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.core.task.TaskExecutor
import org.springframework.stereotype.Service
import java.time.Duration
import java.util.concurrent.RejectedExecutionException

@Service
class TrackUrlVisitService(
    private val eventWriter: UrlVisitEventWriter,
    @Qualifier("analyticsExecutor") private val executor: TaskExecutor,
    properties: AnalyticsTrackingProperties,
    meterRegistry: MeterRegistry
) : UrlVisitTracker {

    private val log = LoggerFactory.getLogger(TrackUrlVisitService::class.java)
    private val budget = Bucket.builder().addLimit(
        Bandwidth.builder().capacity(properties.eventsPerMinute)
            .refillIntervally(properties.eventsPerMinute, Duration.ofMinutes(1)).build()
    ).build()
    private val dropped = meterRegistry.counter("analytics.tracking.dropped")

    override fun track(command: UrlVisitTrackingCommand) {
        if (!budget.tryConsume(1)) {
            dropped.increment()
            return
        }
        try {
            executor.execute {
                try {
                    eventWriter.enrichAndPersist(command)
                } catch (e: Exception) {
                    log.error("Failed to track visit for urlHash={}: {}", command.urlHash, e.message, e)
                }
            }
        } catch (_: RejectedExecutionException) {
            // Analytics overload must never delay or fail the redirect.
            dropped.increment()
        }
    }
}
