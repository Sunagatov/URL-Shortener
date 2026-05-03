package com.zufar.urlshortener.users.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

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
    val emailVerifiedAt: Instant? = null,
    val emailVerificationCodeHash: String? = null,
    val emailVerificationCodeExpiresAt: Instant? = null,
    val emailVerificationCodeSentAt: Instant? = null,

    val tokenVersion: Int = 0,

    val passwordResetTokenHash: String? = null,
    val passwordResetTokenId: String? = null,
    val passwordResetTokenExpiresAt: Instant? = null,

    val createdAt: Instant? = null,
    val updatedAt: Instant? = null
)
