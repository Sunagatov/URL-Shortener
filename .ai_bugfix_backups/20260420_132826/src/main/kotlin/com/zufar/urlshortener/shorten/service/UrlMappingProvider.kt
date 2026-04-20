package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.shorten.dto.UrlMappingDto
import com.zufar.urlshortener.shorten.exception.UrlNotFoundException
import com.zufar.urlshortener.shorten.repository.UrlRepository
import org.springframework.stereotype.Service

@Service
class UrlMappingProvider(private val urlRepository: UrlRepository) {

    fun getUrlMappingByHash(urlHash: String): UrlMappingDto {
        return urlRepository.findByUrlHash(urlHash)
            .map(UrlMappingDto::fromEntity)
            .orElseThrow { UrlNotFoundException("URL mapping not found") }
    }
}
