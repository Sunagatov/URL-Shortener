package com.zufar.urlshortener.users.dto

import com.zufar.urlshortener.shared.security.NewPassword
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class ChangePasswordRequest(

    @field:NotBlank(message = "Password must not be empty")
    val currentPassword: String,

    @field:NotBlank(message = PASSWORD_MUST_NOT_BE_EMPTY)
    @field:NewPassword
    val newPassword: String
)
