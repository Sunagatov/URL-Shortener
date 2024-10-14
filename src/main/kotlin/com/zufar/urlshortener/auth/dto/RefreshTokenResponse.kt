package com.zufar.urlshortener.auth.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Response containing a new access token.")
data class RefreshTokenResponse(

    @Schema(description = "New JWT access token.", required = true)
    val accessToken: String
)
