package com.zufar.urlshortener.auth.api

import com.zufar.urlshortener.users.entity.UserAccountDocument
import java.time.LocalDateTime

interface AuthenticatedUserContext {
    fun requireAuthenticatedUser(): UserAccountDocument
    fun requireAuthenticatedUserId(): String
    fun findAuthenticatedUserIdOrNull(): String?
    fun updatePassword(currentUser: UserAccountDocument, encodedPassword: String, updatedAt: LocalDateTime)
}
