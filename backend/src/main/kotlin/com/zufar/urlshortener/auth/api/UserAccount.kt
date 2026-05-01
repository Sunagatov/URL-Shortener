package com.zufar.urlshortener.auth.api

import java.time.LocalDateTime

data class UserAccount(
    val id: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val passwordHash: String,
    val country: String,
    val age: Int,
    val createdAt: LocalDateTime?,
    val tokenVersion: Int
)
