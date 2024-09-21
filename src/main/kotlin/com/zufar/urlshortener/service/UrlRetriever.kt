package com.zufar.urlshortener.service

import com.zufar.urlshortener.repository.UrlRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class UrlRetriever(
    private val urlRepository: UrlRepository
) {
    private val log = LoggerFactory.getLogger(UrlRetriever::class.java)

    fun retrieveUrl(shortUrl: String): String? {
        log.info("Trying to retrieve original URL for shortUrl='{}'", shortUrl)

        val urlMappingOptional = urlRepository.findByShortUrl(shortUrl)

        if (urlMappingOptional.isPresent) {
            val originalUrl = urlMappingOptional.get().originalUrl
            log.info("Successfully found originalUrl='{}' for shortUrl='{}' in MongoDB", originalUrl, shortUrl)
            return originalUrl
        }

        log.warn("No original URL found for shortUrl='{}'", shortUrl)
        return null
    }
}
