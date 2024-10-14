package com.zufar.urlshortener.auth.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Sign-up request containing new user details.")
data class SignUpRequest(

    @Schema(description = "User's first name.", example = "John", required = true, maxLength = 50)
    val firstName: String,

    @Schema(description = "User's last name.", example = "Doe", required = true, maxLength = 50)
    val lastName: String,

    @Schema(description = "User's country.", example = "USA", required = true, maxLength = 50)
    val country: String,

    @Schema(description = "User's age.", example = "30", required = true, minimum = "1", maximum = "150")
    val age: Int,

    @Schema(description = "User's email address.", example = "john.doe@example.com", required = true, maxLength = 100)
    val email: String,

    @Schema(description = "User's password.", example = "password123", required = true, minLength = 8, maxLength = 50)
    val password: String
)
