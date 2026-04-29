package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.urls.dto.UrlMappingPageDto
import com.zufar.urlshortener.urls.service.PageableUrlMappingsProvider
import com.zufar.urlshortener.urls.service.UrlDeleter
import com.zufar.urlshortener.urls.service.UrlMappingProvider
import com.zufar.urlshortener.urls.service.UrlShortener
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UrlControllerTest {

    @Mock private lateinit var urlShortener: UrlShortener
    @Mock private lateinit var urlDeleter: UrlDeleter
    @Mock private lateinit var pageableUrlMappingsProvider: PageableUrlMappingsProvider
    @Mock private lateinit var urlMappingProvider: UrlMappingProvider

    private fun controller() = UrlController(
        urlShortener = urlShortener,
        urlDeleter = urlDeleter,
        pageableUrlMappingsProvider = pageableUrlMappingsProvider,
        urlMappingProvider = urlMappingProvider
    )

    @Test
    fun `getUserUrlMappings rejects negative page`() {
        assertThrows<InvalidRequestException> {
            controller().getUserUrlMappings(page = -1, size = 10)
        }
    }

    @Test
    fun `getUserUrlMappings rejects zero size`() {
        assertThrows<InvalidRequestException> {
            controller().getUserUrlMappings(page = 0, size = 0)
        }
    }

    @Test
    fun `getUserUrlMappings rejects oversized page size`() {
        assertThrows<InvalidRequestException> {
            controller().getUserUrlMappings(page = 0, size = 101)
        }
    }

    @Test
    fun `getUserUrlMappings delegates for valid pagination`() {
        val page = UrlMappingPageDto(
            content = emptyList(),
            page = 0,
            size = 10,
            totalElements = 0,
            totalPages = 0
        )
        whenever(pageableUrlMappingsProvider.getUrlMappingsPage(0, 10)).thenReturn(page)

        val response = controller().getUserUrlMappings(page = 0, size = 10)

        verify(pageableUrlMappingsProvider).getUrlMappingsPage(0, 10)
        assertEquals(page, response.body)
    }
}
