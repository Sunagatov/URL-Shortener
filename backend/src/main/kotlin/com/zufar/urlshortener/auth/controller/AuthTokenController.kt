package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenResponse
import com.zufar.urlshortener.auth.service.token.RefreshAccessTokenService
import com.zufar.urlshortener.shared.exception.ErrorResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthTokenController(
    private val refreshAccessTokenService: RefreshAccessTokenService
) {

    @PostMapping("/refresh-token")
    fun refreshAccessToken(
        @RequestBody refreshTokenRequest: RefreshTokenRequest
    ): ResponseEntity<RefreshTokenResponse> =
        ResponseEntity.ok(refreshAccessTokenService.refresh(refreshTokenRequest))
}
