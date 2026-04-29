package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.urls.repository.UrlRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class UrlDeleter(
    private val urlRepository: UrlRepository,
    private val urlAccessService: UrlAccessService
) {
    private val log = LoggerFactory.getLogger(UrlDeleter::class.java)

    fun deleteUrl(urlHash: String) {
        val urlMapping = urlAccessService.getOwnedActiveUrlMapping(
            urlHash = urlHash,
            accessDeniedMessage = "You are not allowed to delete this URL mapping"
        )
        urlRepository.deleteById(urlMapping.urlHash)
        log.info("Deleted URL mapping for urlHash='{}'", urlHash)
    }
}
