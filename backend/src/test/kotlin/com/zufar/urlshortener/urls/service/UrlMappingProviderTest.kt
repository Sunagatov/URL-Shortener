package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.service.query.UrlQueryService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.LocalDateTime
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UrlMappingProviderTest {

    @Mock private lateinit var urlAccessService: UrlAccessService

    @Test
    fun `getPublicUrlMappingByHash maps active url mapping`() {
        val urlMapping = mapping()
        whenever(urlAccessService.getActiveUrlMapping("abc12345")).thenReturn(urlMapping)

        val result = UrlQueryService(urlAccessService).getPublicByHash("abc12345")

        assertEquals(UrlMappingDto.fromEntity(urlMapping), result)
    }

    @Test
    fun `getOwnedUrlMappingByHash delegates ownership lookup`() {
        val urlMapping = mapping()
        whenever(urlAccessService.getOwnedActiveUrlMapping("abc12345", "You are not allowed to access this URL mapping"))
            .thenReturn(urlMapping)

        val result = UrlQueryService(urlAccessService).getOwnedByHash("abc12345")

        verify(urlAccessService).getOwnedActiveUrlMapping("abc12345", "You are not allowed to access this URL mapping")
        assertEquals(UrlMappingDto.fromEntity(urlMapping), result)
    }

    private fun mapping() = UrlMapping(
        urlHash = "abc12345",
        shortUrl = "http://localhost:8080/abc12345",
        originalUrl = "https://example.com",
        createdAt = LocalDateTime.parse("2023-12-31T10:15:30"),
        expirationDate = LocalDateTime.parse("2024-01-02T10:15:30"),
        requestIp = "127.0.0.1",
        userAgent = "JUnit",
        userId = "user-123"
    )
}
