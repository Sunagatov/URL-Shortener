package com.zufar.urlshortener.auth.api

interface PasswordPolicyValidator {
    fun validate(password: String)
}
