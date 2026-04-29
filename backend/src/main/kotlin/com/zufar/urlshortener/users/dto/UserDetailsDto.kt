package com.zufar.urlshortener.users.dto

import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(description = "Details about a user")
data class UserDetailsDto(

    @Schema(description = "User's first name", example = "John")
    val firstName: String,

    @Schema(description = "User's last name", example = "Doe")
    val lastName: String,

    @Schema(description = "User's email address", example = "john.doe@example.com")
    val email: String,

    @Schema(description = "User's country", example = "USA")
    val country: String,

    @Schema(description = "User's age", example = "30")
    val age: Int,

    @Schema(description = "Timestamp when the user account was created", example = "2024-01-15T10:00:00")
    val createdAt: LocalDateTime?
)
