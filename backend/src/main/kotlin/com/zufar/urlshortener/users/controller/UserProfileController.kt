package com.zufar.urlshortener.users.controller

import com.zufar.urlshortener.shared.exception.ErrorResponse
import com.zufar.urlshortener.users.dto.UserDetailsDto
import com.zufar.urlshortener.users.service.query.UserProfileService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
class UserProfileController(
    private val userProfileService: UserProfileService
) {

    @GetMapping(
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun getUserDetails(): ResponseEntity<UserDetailsDto> =
        ResponseEntity.ok(userProfileService.getUserDetails())
}
