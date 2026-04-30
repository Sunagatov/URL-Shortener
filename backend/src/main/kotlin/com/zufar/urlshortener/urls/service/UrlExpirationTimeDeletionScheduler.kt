package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.urls.repository.UrlRepository
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.CacheEvict
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.Clock
import java.time.LocalDateTime

@Component
class UrlExpirationTimeDeletionScheduler(
    private val urlRepository: UrlRepository,
    private val clock: Clock
) {
    private val log = LoggerFactory.getLogger(UrlExpirationTimeDeletionScheduler::class.java)

    @CacheEvict(cacheNames = ["urlMappings"], allEntries = true)
    @Scheduled(cron = "\${scheduler.url.expiration.cron:0 0 0 * * *}")
    fun deleteExpiredUrls() {
        log.info("Deleting expired URLs")
        urlRepository.deleteAllByExpirationDateBefore(LocalDateTime.now(clock))
    }
}
