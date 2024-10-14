package com.zufar.urlshortener.auth.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Request to refresh access token using refresh token.")
data class RefreshTokenRequest(

    @Schema(description = "JWT refresh token.", required = true)
    val refreshToken: String
)
