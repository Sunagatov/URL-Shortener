package com.zufar.urlshortener.auth.security

import org.springframework.security.core.userdetails.UserDetails

interface UserDetailsWithTokenVersion : UserDetails {
    val tokenVersion: Int
    val userId: String?
    val emailVerified: Boolean
}

fun UserDetails.withTokenVersion(
    tokenVersion: Int,
    userId: String? = null,
    emailVerified: Boolean = true
): UserDetails =
    object : UserDetailsWithTokenVersion, UserDetails by this {
        override val tokenVersion: Int = tokenVersion
        override val userId: String? = userId
        override val emailVerified: Boolean = emailVerified
    }
