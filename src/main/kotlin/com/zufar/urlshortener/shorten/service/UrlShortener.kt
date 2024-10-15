package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.shorten.dto.ShortenUrlRequest
import com.zufar.urlshortener.shorten.repository.UrlRepository
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class UrlShortener(
    private val urlRepository: UrlRepository,
    private val urlValidator: UrlValidator,
    private val daysCountValidator: DaysCountValidator,
    private val urlMappingEntityCreator: UrlMappingEntityCreator,
    private val userRepository: UserRepository
) {
    private val log = LoggerFactory.getLogger(UrlShortener::class.java)

    @Value("\${app.base-url}")
    private lateinit var baseUrl: String

    fun shortenUrl(shortenUrlRequest: ShortenUrlRequest,
                   httpServletRequest: HttpServletRequest): String {

        val originalUrl = shortenUrlRequest.originalUrl
        val clientIp = httpServletRequest.remoteAddr
        val userAgent = httpServletRequest.getHeader("User-Agent")

        log.info("Trying to shorten originalURL='{}' from IP='{}', User-Agent='{}'", originalUrl, clientIp, userAgent)

        urlValidator.validateUrl(originalUrl)
        daysCountValidator.validateDaysCount(shortenUrlRequest.daysCount)
        log.debug("URL validation passed for originalURL='{}'", originalUrl)

        val urlHash = StringEncoder.encode(originalUrl)
        log.debug("Encoded originalURL='{}' to urlHash='{}'", originalUrl, urlHash)

        val newShortUrl = "$baseUrl/url/$urlHash"
        log.info("Generated new shortURL='{}' for originalURL='{}'", newShortUrl, originalUrl)

        val urlMapping = urlMappingEntityCreator.create(shortenUrlRequest, httpServletRequest, urlHash, newShortUrl)
        urlRepository.save(urlMapping)
        log.info("Saved URL mapping for urlHash='{}' in MongoDB", urlHash)

        return newShortUrl
    }
}