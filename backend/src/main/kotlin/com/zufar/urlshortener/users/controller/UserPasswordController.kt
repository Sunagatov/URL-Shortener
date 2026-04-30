package com.zufar.urlshortener.users.controller

import com.zufar.urlshortener.shared.exception.ErrorResponse
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.service.command.ChangePasswordService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
class UserPasswordController(
    private val changePasswordService: ChangePasswordService
) {

    @PutMapping(
        value = ["/change-password"],
        consumes = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun changePassword(@RequestBody changePasswordRequest: ChangePasswordRequest): ResponseEntity<Void> {
        changePasswordService.changePassword(changePasswordRequest)
        return ResponseEntity.noContent().build()
    }
}
