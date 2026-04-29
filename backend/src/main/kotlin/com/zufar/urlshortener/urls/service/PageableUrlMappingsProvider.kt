package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.auth.repository.UserRepository
import com.zufar.urlshortener.auth.service.EmailNormalizer
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.dto.UrlMappingPageDto
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.springframework.data.domain.PageRequest
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class PageableUrlMappingsProvider(
    private val urlRepository: UrlRepository,
    private val userRepository: UserRepository
) {

    fun getUrlMappingsPage(page: Int, size: Int): UrlMappingPageDto {
        val pageable = PageRequest.of(page, size)

        val authentication = SecurityContextHolder.getContext().authentication
        val email = authentication?.name ?: throw AuthenticationCredentialsNotFoundException("User is not authenticated")
        if (email.isBlank() || email == "anonymousUser") {
            throw AuthenticationCredentialsNotFoundException("User is not authenticated")
        }
        val normalizedEmail = EmailNormalizer.normalize(email)
        val user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw UserNotFoundException("User not found")
        val userId = user.id ?: throw UserNotFoundException("User not found")

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
