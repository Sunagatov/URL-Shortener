package com.zufar.urlshortener.moderation.controller

import com.zufar.urlshortener.moderation.dto.DisableUrlMappingRequest
import com.zufar.urlshortener.moderation.service.ModerationService
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/admin/url-mappings")
class AdminModerationController(
    private val moderationService: ModerationService
) {
    @PostMapping("/{urlHash}/disable", consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun disableUrlMapping(
        @PathVariable urlHash: String,
        @Valid @RequestBody request: DisableUrlMappingRequest
    ): ResponseEntity<UrlMappingDto> =
        ResponseEntity.ok(moderationService.disableUrlMapping(urlHash, request))
}
