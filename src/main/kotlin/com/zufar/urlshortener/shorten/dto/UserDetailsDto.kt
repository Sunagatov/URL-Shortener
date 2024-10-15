package com.zufar.urlshortener.shorten.dto

import io.swagger.v3.oas.annotations.media.Schema

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
    val age: Int
)
