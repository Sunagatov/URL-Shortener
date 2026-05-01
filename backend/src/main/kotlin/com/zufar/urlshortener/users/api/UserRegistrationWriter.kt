package com.zufar.urlshortener.users.api

interface UserRegistrationWriter {
    fun save(userAccount: UserAccountRecord): UserAccountRecord
}
