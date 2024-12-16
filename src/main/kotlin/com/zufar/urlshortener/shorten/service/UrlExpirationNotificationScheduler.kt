package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.auth.service.CustomUserDetailsService
import com.zufar.urlshortener.shorten.repository.UrlRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDateTime

@Component
class UrlExpirationNotificationScheduler(
    private val urlRepository: UrlRepository,
    private val emailNotificationService: EmailNotificationService,
    private val userDetailsService: CustomUserDetailsService
) {
    private val log = LoggerFactory.getLogger(UrlExpirationNotificationScheduler::class.java)

    @Scheduled(cron = "0 0 0 * * *")
    fun notifyExpiringUrls() {
        log.info("Starting expiration notification task")
        val thresholdDate = LocalDateTime.now().plusDays(7)

        val expiringUrls = urlRepository.findAll().filter { it.expirationDate.isBefore(thresholdDate) }

        if (expiringUrls.isEmpty()) {
            log.info("No URLs found nearing expiration")
            return
        }

        expiringUrls.forEach { url ->
            val email = userDetailsService.getEmailByUserId(url.userId ?: "")
            try {
                emailNotificationService.sendExpirationNotification(
                    email = email,
                    shortUrl = url.shortUrl,
                    expirationDate = url.expirationDate.toString()
                )
                log.info("Sent expiration notification for URL: ${url.shortUrl} to user: $email")
            } catch (e: Exception) {
                log.error("Failed to send notification for URL: ${url.shortUrl} to user: $email", e)
            }
        }
    }
}