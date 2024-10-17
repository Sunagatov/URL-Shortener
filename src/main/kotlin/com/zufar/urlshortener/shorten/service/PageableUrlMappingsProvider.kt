package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.shorten.dto.UrlMappingDto
import com.zufar.urlshortener.shorten.dto.UrlMappingPageDto
import com.zufar.urlshortener.shorten.repository.UrlRepository
import org.springframework.data.domain.PageRequest
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class PageableUrlMappingsProvider(
    private val urlRepository: UrlRepository,
    private val userRepository: UserRepository
) {

    fun getUrlMappingsPage(page: Int, size: Int): UrlMappingPageDto {
        val pageable = PageRequest.of(page, size)

        // Retrieve the authenticated user from SecurityContextHolder
        val authentication = SecurityContextHolder.getContext().authentication
        val email = authentication?.name ?: throw IllegalStateException("User is not authenticated")
        val user = userRepository.findByEmail(email) ?: throw IllegalStateException("User not found")
        val userId = user.id ?: throw IllegalStateException("User ID is missing")

        // Fetch URL mappings for the user
        val urlMappingsPage = urlRepository.findAllByUserId(userId, pageable)

        return UrlMappingPageDto(
            content = urlMappingsPage.content.map { UrlMappingDto.fromEntity(it) },
            page = urlMappingsPage.number,
            size = urlMappingsPage.size,
            totalElements = urlMappingsPage.totalElements,
            totalPages = urlMappingsPage.totalPages
        )
    }
}
