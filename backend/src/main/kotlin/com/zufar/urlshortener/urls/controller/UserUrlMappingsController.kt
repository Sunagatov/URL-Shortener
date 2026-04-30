package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.shared.exception.ErrorResponse
import com.zufar.urlshortener.urls.dto.UrlMappingPageDto
import com.zufar.urlshortener.urls.service.query.UserUrlMappingsQueryService
import com.zufar.urlshortener.urls.validation.UrlMappingsPageRequestValidator
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

private const val DEFAULT_PAGE = 0
private const val DEFAULT_SIZE = 10

@RestController
@RequestMapping("/api/v1/urls")
class UserUrlMappingsController(
    private val userUrlMappingsQueryService: UserUrlMappingsQueryService,
    private val urlMappingsPageRequestValidator: UrlMappingsPageRequestValidator
) {

    @GetMapping
    fun getUserUrlMappings(
        @RequestParam(defaultValue = "$DEFAULT_PAGE") page: Int,
        @RequestParam(defaultValue = "$DEFAULT_SIZE") size: Int
    ): ResponseEntity<UrlMappingPageDto> {
        urlMappingsPageRequestValidator.validate(page, size)
        return ResponseEntity.ok(userUrlMappingsQueryService.getPage(page, size))
    }
}
