package com.zufar.urlshortener.auth.dto

import jakarta.validation.constraints.Size

data class LogoutRequest(
    @field:Size(max = 4096) val refreshToken: String? = null,
    @field:Size(max = 4096) val accessToken: String? = null
)
