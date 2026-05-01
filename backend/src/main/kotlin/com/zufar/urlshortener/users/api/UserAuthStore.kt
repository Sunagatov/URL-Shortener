package com.zufar.urlshortener.users.api

import java.time.LocalDateTime

interface UserAuthStore {
    fun findByEmailIgnoreCase(email: String): UserAccountRecord?

    fun save(userAccount: UserAccountRecord): UserAccountRecord

    fun updatePassword(userId: String, encodedPassword: String, newTokenVersion: Int, updatedAt: LocalDateTime)
}
