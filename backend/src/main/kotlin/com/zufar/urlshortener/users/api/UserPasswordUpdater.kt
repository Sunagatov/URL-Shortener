package com.zufar.urlshortener.users.api

import java.time.LocalDateTime

interface UserPasswordUpdater {
    fun updatePassword(userId: String, encodedPassword: String, newTokenVersion: Int, updatedAt: LocalDateTime)
}
