package com.zufar.urlshortener.users.api

interface UserCredentialsReader {
    fun findByEmailIgnoreCase(email: String): UserAccountRecord?
}
