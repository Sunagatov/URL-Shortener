package com.zufar.urlshortener.users.dto

import com.zufar.urlshortener.auth.dto.PASSWORD_IS_TOO_LONG
import com.zufar.urlshortener.auth.dto.PASSWORD_MUST_BE_AT_LEAST_15_CHARACTERS_LONG
import com.zufar.urlshortener.auth.dto.PASSWORD_MUST_NOT_BE_EMPTY
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class ChangePasswordRequest(

    @field:NotBlank(message = "Password must not be empty")
    val currentPassword: String,

    @field:NotBlank(message = PASSWORD_MUST_NOT_BE_EMPTY)
    @field:Size(min = 15, message = PASSWORD_MUST_BE_AT_LEAST_15_CHARACTERS_LONG)
    @field:Size(max = 64, message = PASSWORD_IS_TOO_LONG)
    val newPassword: String
)
