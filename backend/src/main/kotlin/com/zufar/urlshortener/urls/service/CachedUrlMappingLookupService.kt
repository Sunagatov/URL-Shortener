package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.exception.UrlNotFoundException
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

private const val CACHED_URL_MAPPING_NOT_FOUND_MESSAGE = "URL mapping not found"

@Service
class CachedUrlMappingLookupService(
    private val urlRepository: UrlRepository
) {

    @Cacheable(cacheNames = ["urlMappings"], key = "#urlHash")
    fun getByUrlHash(urlHash: String): UrlMapping =
        urlRepository.findByUrlHash(urlHash)
            .orElseThrow { UrlNotFoundException(CACHED_URL_MAPPING_NOT_FOUND_MESSAGE) }
}
