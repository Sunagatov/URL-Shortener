package com.zufar.urlshortener.urls.controller

import com.zufar.urlshortener.shared.exception.ErrorResponse
import com.zufar.urlshortener.urls.dto.ShortenUrlRequest
import com.zufar.urlshortener.urls.dto.UrlResponse
import com.zufar.urlshortener.urls.service.command.ShortenUrlService
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/urls")
class UrlShorteningController(
    private val shortenUrlService: ShortenUrlService
) {

    @PostMapping(
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun shortenUrl(
        @Valid @RequestBody shortenUrlRequest: ShortenUrlRequest,
        httpServletRequest: HttpServletRequest
    ): ResponseEntity<UrlResponse> =
        ResponseEntity.ok(UrlResponse(shortenUrlService.shorten(shortenUrlRequest, httpServletRequest)))
}
