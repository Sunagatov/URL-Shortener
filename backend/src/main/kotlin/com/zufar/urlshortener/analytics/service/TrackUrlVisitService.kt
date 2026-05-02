package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.entity.TrackUrlVisitCommand
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service

@Service
class TrackUrlVisitService(
    private val eventWriter: UrlVisitEventWriter
) {

    private val log = LoggerFactory.getLogger(TrackUrlVisitService::class.java)

    @Async
    fun trackAsync(command: TrackUrlVisitCommand) {
        try {
            eventWriter.enrichAndPersist(command)
        } catch (e: Exception) {
            log.error("Failed to track visit for urlHash={}: {}", command.urlHash, e.message, e)
        }
    }
}
