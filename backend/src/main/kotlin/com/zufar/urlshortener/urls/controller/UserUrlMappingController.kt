package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.shared.exception.ErrorResponse
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.service.command.DeleteUrlMappingService
import com.zufar.urlshortener.urls.service.query.UrlQueryService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/urls")
class UserUrlMappingController(
    private val deleteUrlMappingService: DeleteUrlMappingService,
    private val urlQueryService: UrlQueryService
) {

    @DeleteMapping("/{urlHash}")
    fun deleteUrlMapping(
        @PathVariable urlHash: String
    ): ResponseEntity<Void> {
        deleteUrlMappingService.delete(urlHash)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{urlHash}")
    fun getUrlMappingByHash(
        @PathVariable urlHash: String
    ): ResponseEntity<UrlMappingDto> =
        ResponseEntity.ok(urlQueryService.getOwnedByHash(urlHash))
}
