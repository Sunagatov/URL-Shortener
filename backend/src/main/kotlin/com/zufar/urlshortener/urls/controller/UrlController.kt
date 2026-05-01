package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.urls.api.UrlApiPaths
import com.zufar.urlshortener.urls.dto.ShortenUrlRequest
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.dto.UrlMappingPageDto
import com.zufar.urlshortener.urls.dto.UrlResponse
import com.zufar.urlshortener.urls.service.UrlManagementService
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(UrlApiPaths.BASE_PATH)
class UrlController(
    private val urlManagementService: UrlManagementService,
    @Value($$"${app.urls.pagination.default-page:0}") private val defaultPage: Int,
    @Value($$"${app.urls.pagination.default-size:10}") private val defaultSize: Int
) {

    @PostMapping(
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun shortenUrl(
        @Valid @RequestBody shortenUrlRequest: ShortenUrlRequest,
        httpServletRequest: HttpServletRequest
    ): ResponseEntity<UrlResponse> =
        ResponseEntity.ok(UrlResponse(urlManagementService.shorten(shortenUrlRequest, httpServletRequest)))

    @GetMapping
    fun getUserUrlMappings(
        @RequestParam(required = false) page: Int?,
        @RequestParam(required = false) size: Int?
    ): ResponseEntity<UrlMappingPageDto> =
        ResponseEntity.ok(urlManagementService.getUserUrlMappings(page ?: defaultPage, size ?: defaultSize))

    @GetMapping("/{urlHash}")
    fun getUrlMappingByHash(
        @PathVariable urlHash: String
    ): ResponseEntity<UrlMappingDto> =
        ResponseEntity.ok(urlManagementService.getOwnedUrlMapping(urlHash))

    @DeleteMapping("/{urlHash}")
    fun deleteUrlMapping(
        @PathVariable urlHash: String
    ): ResponseEntity<Void> {
        urlManagementService.delete(urlHash)
        return ResponseEntity.noContent().build()
    }
}
