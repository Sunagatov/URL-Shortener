package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.shorten.exception.UrlNotFoundException
import com.zufar.urlshortener.shorten.repository.UrlRepository
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.CacheEvict
import org.springframework.stereotype.Service

@Service
class UrlDeleter(
    private val urlRepository: UrlRepository
) {
    private val log = LoggerFactory.getLogger(UrlDeleter::class.java)

    @CacheEvict(value = ["urlMappings"], allEntries = true)
    fun deleteUrl(urlHash: String) {
        if (!urlRepository.existsById(urlHash)) {
            log.warn("URL mapping not found for urlHash='{}'", urlHash)
            throw UrlNotFoundException("No URL mapping found for urlHash='$urlHash'")
        }
        urlRepository.deleteById(urlHash)
        log.info("Deleted URL mapping for urlHash='{}'", urlHash)
    }
}
