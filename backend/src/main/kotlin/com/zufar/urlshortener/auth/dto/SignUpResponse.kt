package com.zufar.urlshortener.auth.dto

data class SignUpResponse(
    val verificationRequired: Boolean,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val email: String? = null,
    val expiresInSeconds: Long? = null,
    val resendAvailableInSeconds: Long? = null,
    val deliveryMode: String? = null
)
