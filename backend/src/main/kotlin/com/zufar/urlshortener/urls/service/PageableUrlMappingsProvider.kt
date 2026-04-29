package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.service.CurrentUserProvider
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.dto.UrlMappingPageDto
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class PageableUrlMappingsProvider(
    private val urlRepository: UrlRepository,
    private val currentUserProvider: CurrentUserProvider
) {

    fun getUrlMappingsPage(page: Int, size: Int): UrlMappingPageDto {
        val pageable = PageRequest.of(page, size)
        val userId = currentUserProvider.requireCurrentUserId()

        val now = LocalDateTime.now()
        val urlMappingsPage = urlRepository.findAllByUserIdAndExpirationDateAfter(userId, now, pageable)

        return UrlMappingPageDto(
            content = urlMappingsPage.content.map { UrlMappingDto.fromEntity(it) },
            page = urlMappingsPage.number,
            size = urlMappingsPage.size,
            totalElements = urlMappingsPage.totalElements,
            totalPages = urlMappingsPage.totalPages
        )
    }
}
