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

    @Scheduled(cron = "\${scheduler.url.expiration.cron:0 0 0 * * *}")
    fun deleteExpiredUrls() {
        log.info("Deleting expired URLs")
        urlRepository.deleteAllByExpirationDateBefore(LocalDateTime.now())
    }
}