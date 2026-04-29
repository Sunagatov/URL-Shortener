package com.zufar.urlshortener.urls.service.query

import com.zufar.urlshortener.auth.service.user.CurrentUserService
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.dto.UrlMappingPageDto
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

@Service
class UserUrlMappingsQueryService(
    private val urlRepository: UrlRepository,
    private val currentUserService: CurrentUserService,
    private val clock: Clock
) {

    fun getPage(page: Int, size: Int): UrlMappingPageDto {
        val pageable = PageRequest.of(page, size)
        val userId = currentUserService.requireCurrentUserId()
        val now = LocalDateTime.now(clock)
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
