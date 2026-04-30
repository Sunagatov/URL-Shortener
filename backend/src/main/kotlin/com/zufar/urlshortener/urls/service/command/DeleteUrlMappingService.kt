package com.zufar.urlshortener.urls.service.command

import com.zufar.urlshortener.urls.repository.UrlRepository
import com.zufar.urlshortener.urls.service.UrlAccessService
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.CacheEvict
import org.springframework.stereotype.Service

@Service
class DeleteUrlMappingService(
    private val urlRepository: UrlRepository,
    private val urlAccessService: UrlAccessService
) {
    private val log = LoggerFactory.getLogger(DeleteUrlMappingService::class.java)

    @CacheEvict(cacheNames = ["urlMappings"], key = "#urlHash")
    fun delete(urlHash: String) {
        val urlMapping = urlAccessService.getOwnedActiveUrlMapping(
            urlHash = urlHash,
            accessDeniedMessage = "You are not allowed to delete this URL mapping"
        )
        urlRepository.deleteById(urlMapping.urlHash)
        log.info("Deleted URL mapping for urlHash='{}'", urlHash)
    }
}
