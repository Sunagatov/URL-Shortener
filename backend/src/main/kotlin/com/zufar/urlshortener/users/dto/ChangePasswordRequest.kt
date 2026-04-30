package com.zufar.urlshortener.users.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Request payload for changing the authenticated user's password.")
data class ChangePasswordRequest(

    @Schema(description = "The user's current password.", required = true, minLength = 1, maxLength = 64)
    val currentPassword: String = "",

    @Schema(description = "The new password to be set.", required = true, minLength = 15, maxLength = 64)
    val newPassword: String = ""
)
