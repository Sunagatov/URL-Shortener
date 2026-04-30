package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.service.authentication.SignInService
import com.zufar.urlshortener.shared.exception.ErrorResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthSignInController(
    private val signInService: SignInService
) {

    @PostMapping("/signin")
    fun authenticateUser(
        @RequestBody signInRequest: SignInRequest
    ): ResponseEntity<AuthResponse> =
        ResponseEntity.ok(signInService.authenticate(signInRequest))
}
