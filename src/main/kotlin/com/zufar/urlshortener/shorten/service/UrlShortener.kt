package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.shorten.dto.ShortenUrlRequest
import com.zufar.urlshortener.shorten.repository.UrlRepository
import com.zufar.urlshortener.statistics.service.updater.ShortenOperationStatisticsUpdater
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class UrlShortener(
    private val urlRepository: UrlRepository,
    private val urlValidator: UrlValidator,
    private val daysCountValidator: DaysCountValidator,
    private val urlMappingEntityCreator: UrlMappingEntityCreator,
    private val statisticsUpdater: ShortenOperationStatisticsUpdater
) {
    private val log = LoggerFactory.getLogger(UrlShortener::class.java)

    @Value("\${app.base-url}")
    private lateinit var baseUrl: String

    fun shortenUrl(
        shortenUrlRequest: ShortenUrlRequest,
        httpServletRequest: HttpServletRequest
    ): String {
        val originalUrl = shortenUrlRequest.originalUrl

        var urlHash = StringEncoder.encode(originalUrl)
        val urlMappingOptional = urlRepository.findByUrlHash(urlHash)

        if (urlMappingOptional.isPresent) {
            log.info("ShortUrl found for the urlHash='{}' in database", urlHash)
            return urlMappingOptional.get().shortUrl
        }

        log.info("No existing shortUrl found for the urlHash='{}'. Creating a new one.", urlHash)

        val clientIp = httpServletRequest.remoteAddr
        val userAgent = httpServletRequest.getHeader("User-Agent")

        log.info("Trying to shorten originalURL='{}' from IP='{}', User-Agent='{}'", originalUrl, clientIp, userAgent)

        urlValidator.validateUrl(originalUrl)
        daysCountValidator.validateDaysCount(shortenUrlRequest.daysCount)
        log.debug("URL validation passed for originalURL='{}'", originalUrl)

        urlHash = StringEncoder.encode(originalUrl)
        log.debug("Encoded originalURL='{}' to urlHash='{}'", originalUrl, urlHash)

        val newShortUrl = "$baseUrl/url/$urlHash"
        log.info("Generated new shortURL='{}' for originalURL='{}'", newShortUrl, originalUrl)

        val createdUrl = urlMappingEntityCreator.create(shortenUrlRequest, httpServletRequest, urlHash, newShortUrl)
        urlRepository.save(createdUrl)
        log.info("Saved URL mapping for urlHash='{}' in MongoDB", urlHash)

        val userId = createdUrl.userId ?: "anonymous"

        statisticsUpdater.updateStatistics(userId, urlHash, newShortUrl, originalUrl)
        log.info("Statistics was updated for 'ShortenUrl' operation with url={}", urlHash)

        return newShortUrl
    }
}