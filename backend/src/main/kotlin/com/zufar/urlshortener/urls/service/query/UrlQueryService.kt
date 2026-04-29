package com.zufar.urlshortener.urls.service.query

import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.service.UrlAccessService
import org.springframework.stereotype.Service

@Service
class UrlQueryService(
    private val urlAccessService: UrlAccessService
) {

    fun getPublicByHash(urlHash: String): UrlMappingDto =
        UrlMappingDto.fromEntity(urlAccessService.getActiveUrlMapping(urlHash))

    fun getOwnedByHash(urlHash: String): UrlMappingDto =
        UrlMappingDto.fromEntity(
            urlAccessService.getOwnedActiveUrlMapping(
                urlHash = urlHash,
                accessDeniedMessage = "You are not allowed to access this URL mapping"
            )
        )
}
