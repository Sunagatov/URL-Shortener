package com.zufar.urlshortener.auth.controller

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.auth.service.registration.SignUpService
import com.zufar.urlshortener.shared.exception.ErrorResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthSignUpController(
    private val signUpService: SignUpService
) {

    @PostMapping("/signup")
    fun registerUser(
        @RequestBody signUpRequest: SignUpRequest
    ): ResponseEntity<AuthResponse> =
        ResponseEntity.ok(signUpService.register(signUpRequest))
}
