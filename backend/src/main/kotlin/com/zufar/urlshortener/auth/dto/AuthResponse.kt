package com.zufar.urlshortener.auth.dto


data class AuthResponse(

    val accessToken: String,

    val refreshToken: String
)
