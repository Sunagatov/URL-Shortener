package com.zufar.urlshortener.users.controller

import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.dto.UpdateProfileRequest
import com.zufar.urlshortener.users.dto.UserDetailsDto
import com.zufar.urlshortener.users.service.UserAccountService
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
class UserAccountController(
    private val userAccountService: UserAccountService
) {

    @GetMapping(
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun getUserDetails(): ResponseEntity<UserDetailsDto> =
        ResponseEntity.ok(userAccountService.getCurrentUserDetails())

    @PutMapping(
        consumes = [MediaType.APPLICATION_JSON_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun updateProfile(@Valid @RequestBody request: UpdateProfileRequest): ResponseEntity<UserDetailsDto> =
        ResponseEntity.ok(userAccountService.updateProfile(request))

    @PutMapping(
        value = ["/change-password"],
        consumes = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun changePassword(@Valid @RequestBody changePasswordRequest: ChangePasswordRequest): ResponseEntity<Void> {
        userAccountService.changePassword(changePasswordRequest)
        return ResponseEntity.noContent().build()
    }
}
