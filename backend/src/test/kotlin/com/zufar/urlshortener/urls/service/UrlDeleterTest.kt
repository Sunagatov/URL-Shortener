package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.repository.UrlRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.LocalDateTime

@ExtendWith(MockitoExtension::class)
class UrlDeleterTest {

    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var urlAccessService: UrlAccessService

    @Test
    fun `deleteUrl deletes owned mapping`() {
        val urlMapping = UrlMapping(
            urlHash = "abc12345",
            shortUrl = "http://localhost:8080/abc12345",
            originalUrl = "https://example.com",
            createdAt = LocalDateTime.parse("2023-12-31T10:15:30"),
            expirationDate = LocalDateTime.parse("2024-01-02T10:15:30"),
            requestIp = "127.0.0.1",
            userAgent = "JUnit",
            userId = "user-123"
        )
        whenever(urlAccessService.getOwnedActiveUrlMapping("abc12345", "You are not allowed to delete this URL mapping"))
            .thenReturn(urlMapping)

        UrlDeleter(urlRepository, urlAccessService).deleteUrl("abc12345")

        verify(urlRepository).deleteById("abc12345")
    }
}
