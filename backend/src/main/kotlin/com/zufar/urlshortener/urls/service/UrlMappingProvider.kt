package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.urls.dto.UrlMappingDto
import org.springframework.stereotype.Service

@Service
class UrlMappingProvider(
    private val urlAccessService: UrlAccessService
) {

    fun getPublicUrlMappingByHash(urlHash: String): UrlMappingDto {
        return UrlMappingDto.fromEntity(urlAccessService.getActiveUrlMapping(urlHash))
    }

    fun getOwnedUrlMappingByHash(urlHash: String): UrlMappingDto {
        val urlMapping = urlAccessService.getOwnedActiveUrlMapping(
            urlHash = urlHash,
            accessDeniedMessage = "You are not allowed to access this URL mapping"
        )
        return UrlMappingDto.fromEntity(urlMapping)
    }
}
