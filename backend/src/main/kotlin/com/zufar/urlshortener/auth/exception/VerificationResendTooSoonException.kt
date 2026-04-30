package com.zufar.urlshortener.auth.exception

class VerificationResendTooSoonException(
    message: String,
    val retryAfterSeconds: Long
) : RuntimeException(message)
