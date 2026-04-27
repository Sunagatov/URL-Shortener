package com.zufar.urlshortener.auth.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Authentication response containing access and refresh tokens.")
data class AuthResponse(

    @Schema(description = "JWT access token.", required = true)
    val accessToken: String,

    @Schema(description = "JWT refresh token.", required = true)
    val refreshToken: String
)
