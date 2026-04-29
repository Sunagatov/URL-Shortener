package com.zufar.urlshortener.users.controller

import com.zufar.urlshortener.shared.exception.ErrorResponse
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.service.UserPasswordChanger
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/users")
@Tag(
    name = "User Management",
    description = "Operations related to managing and retrieving user details."
)
class UserPasswordController(
    private val userPasswordChanger: UserPasswordChanger
) {

    @Operation(
        summary = "Change Password",
        description = "Changes the password of the authenticated user."
    )
    @ApiResponse(responseCode = "204", description = "Password changed successfully.")
    @ApiResponse(
        responseCode = "400",
        description = "Invalid current or new password.",
        content = [Content(
            mediaType = MediaType.APPLICATION_JSON_VALUE,
            schema = Schema(implementation = ErrorResponse::class)
        )]
    )
    @PutMapping(
        value = ["/change-password"],
        consumes = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun changePassword(@RequestBody changePasswordRequest: ChangePasswordRequest): ResponseEntity<Void> {
        userPasswordChanger.changePassword(changePasswordRequest)
        return ResponseEntity.noContent().build()
    }
}
