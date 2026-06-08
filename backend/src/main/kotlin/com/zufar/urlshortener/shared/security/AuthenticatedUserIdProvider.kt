package com.zufar.urlshortener.shared.security

interface AuthenticatedUserIdProvider {
    fun requireAuthenticatedUserId(): String

    fun findAuthenticatedUserIdOrNull(): String?
}
