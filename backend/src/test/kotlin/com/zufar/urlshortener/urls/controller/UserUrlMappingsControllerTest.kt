package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.urls.dto.UrlMappingPageDto
import com.zufar.urlshortener.urls.service.query.UserUrlMappingsQueryService
import com.zufar.urlshortener.urls.validation.UrlMappingsPageRequestValidator
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class UserUrlMappingsControllerTest {

    @Mock private lateinit var userUrlMappingsQueryService: UserUrlMappingsQueryService
    @Mock private lateinit var urlMappingsPageRequestValidator: UrlMappingsPageRequestValidator

    private fun controller() = UserUrlMappingsController(userUrlMappingsQueryService, urlMappingsPageRequestValidator)

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
        whenever(userUrlMappingsQueryService.getPage(0, 10)).thenReturn(page)

        val response = controller().getUserUrlMappings(page = 0, size = 10)

        verify(urlMappingsPageRequestValidator).validate(0, 10)
        verify(userUrlMappingsQueryService).getPage(0, 10)
        assertEquals(page, response.body)
    }
}
