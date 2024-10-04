package com.zufar.urlshortener.service

import com.zufar.urlshortener.exception.UrlNotFoundException
import com.zufar.urlshortener.repository.UrlRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class UrlDeleter(
    private val urlRepository: UrlRepository
) {
    private val log = LoggerFactory.getLogger(UrlDeleter::class.java)

    fun deleteUrl(urlHash: String) {
        log.info("Attempting to delete URL mapping for urlHash='{}'", urlHash)
        if (urlRepository.existsById(urlHash)) {
            log.info("Found URL mapping for urlHash='{}'. Deleting...", urlHash)
            urlRepository.deleteById(urlHash)
            log.info("Successfully deleted URL mapping for urlHash='{}'", urlHash)
        } else {
            log.warn("No URL mapping found for urlHash='{}'. Deletion failed.", urlHash)
            throw UrlNotFoundException("No URL mapping found for urlHash='$urlHash'. Deletion failed.")
        }
    }
}
