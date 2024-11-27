package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.shorten.entity.UrlMapping
import com.zufar.urlshortener.shorten.exception.UrlNotFoundException
import com.zufar.urlshortener.shorten.repository.UrlRepository
import com.zufar.urlshortener.statistics.service.updater.RedirectOperationStatisticsUpdater
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class RedirectUrlService(
    private val urlRepository: UrlRepository,
    private val statisticsUpdater: RedirectOperationStatisticsUpdater
) {

    private val log = LoggerFactory.getLogger(RedirectUrlService::class.java)

    fun get(urlHash: String): String {
        val urlMapping: UrlMapping = urlRepository.findByUrlHash(urlHash)
            .orElseThrow {
                log.error("Original URL not found for urlHash='{}'", urlHash)
                throw UrlNotFoundException("Original URL is absent for urlHash='$urlHash'")
            }

        val userId = urlMapping.userId ?: "anonymous"

        statisticsUpdater.updateStatistics(userId, urlHash,
            shortenedUrl = urlMapping.shortUrl,
            originalUrl = urlMapping.originalUrl
        )
        log.info("Statistics was updated for 'RedirectUrl' operation with urlHash='{}'", urlHash)

        return urlMapping.originalUrl;
    }
}
