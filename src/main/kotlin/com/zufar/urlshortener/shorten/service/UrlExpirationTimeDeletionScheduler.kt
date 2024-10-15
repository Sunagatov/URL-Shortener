package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.shorten.repository.UrlRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDateTime

@Component
class UrlExpirationTimeDeletionScheduler(
    private val urlRepository: UrlRepository
) {
    private val log = LoggerFactory.getLogger(UrlExpirationTimeDeletionScheduler::class.java)

    @Scheduled(cron = "0 0 0 * * *")// Run once every 24 hours at midnight
    fun deleteExpiredUrls() {
        log.info("Checking for expired URLs")

        val expiredUrls = urlRepository.findAll().filter { it.expirationDate.isBefore(LocalDateTime.now()) }
        if (expiredUrls.isNotEmpty()) {
            log.info("Found {} expired URLs, deleting them...", expiredUrls.size)
            urlRepository.deleteAll(expiredUrls)
        } else {
            log.info("No expired URLs found.")
        }
    }
}