package com.zufar.urlshortener.auth.dto

data class VerificationChallengeResponse(
    val email: String,
    val expiresInSeconds: Long,
    val resendAvailableInSeconds: Long,
    val deliveryMode: String
)
