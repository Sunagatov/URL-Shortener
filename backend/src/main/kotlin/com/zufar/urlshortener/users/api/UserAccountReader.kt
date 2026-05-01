package com.zufar.urlshortener.users.api

interface UserAccountReader {
    fun findByEmailIgnoreCase(email: String): UserAccountRecord?
}
