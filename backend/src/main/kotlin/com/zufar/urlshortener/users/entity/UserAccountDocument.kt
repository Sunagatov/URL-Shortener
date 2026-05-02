package com.zufar.urlshortener.users.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "user_details")
data class UserAccountDocument(

    @Id
    val id: String? = null,
    val firstName: String,
    val lastName: String,
    val password: String? = null,
    val country: String? = null,
    val age: Int? = null,

    @Indexed(unique = true)
    val email: String,

    val authProvider: AuthProvider = AuthProvider.LOCAL,

    val emailVerified: Boolean = false,
    val emailVerifiedAt: LocalDateTime? = null,
    val emailVerificationCodeHash: String? = null,
    val emailVerificationCodeExpiresAt: LocalDateTime? = null,
    val emailVerificationCodeSentAt: LocalDateTime? = null,

    val tokenVersion: Int = 0,

    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)
