package com.zufar.urlshortener.auth.api

import java.time.LocalDateTime

interface AuthenticatedUserContext {
    fun requireAuthenticatedUser(): UserAccount
    fun requireAuthenticatedUserId(): String
    fun findAuthenticatedUserIdOrNull(): String?
    fun updatePassword(currentUser: UserAccount, encodedPassword: String, updatedAt: LocalDateTime)
}
