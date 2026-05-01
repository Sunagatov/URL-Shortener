package com.zufar.urlshortener.auth.api

import com.zufar.urlshortener.users.api.UserAccountRecord
import java.time.LocalDateTime

interface AuthenticatedUserContext {
    fun requireAuthenticatedUser(): UserAccountRecord
    fun requireAuthenticatedUserId(): String
    fun findAuthenticatedUserIdOrNull(): String?
    fun updatePassword(currentUser: UserAccountRecord, encodedPassword: String, updatedAt: LocalDateTime)
}
