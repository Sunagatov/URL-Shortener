package com.zufar.urlshortener.users.api

import java.time.LocalDateTime

data class UserAccountRecord(
    val id: String? = null,
    val firstName: String,
    val lastName: String,
    val password: String,
    val country: String,
    val age: Int,
    val email: String,
    val emailVerified: Boolean = false,
    val emailVerifiedAt: LocalDateTime? = null,
    val emailVerificationCodeHash: String? = null,
    val emailVerificationCodeExpiresAt: LocalDateTime? = null,
    val emailVerificationCodeSentAt: LocalDateTime? = null,
    val tokenVersion: Int = 0,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)
