package com.zufar.urlshortener.auth.api

import java.time.LocalDateTime

interface CurrentUserAccess {
    fun requireCurrentUser(): UserAccount
    fun requireCurrentUserId(): String
    fun getCurrentUserIdOrNull(): String?
    fun updatePassword(currentUser: UserAccount, encodedPassword: String, updatedAt: LocalDateTime)
}
