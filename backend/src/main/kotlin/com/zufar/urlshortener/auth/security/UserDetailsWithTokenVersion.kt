package com.zufar.urlshortener.auth.security

import org.springframework.security.core.userdetails.UserDetails

interface UserDetailsWithTokenVersion : UserDetails {
    val tokenVersion: Int
    val userId: String?
}

fun UserDetails.withTokenVersion(tokenVersion: Int, userId: String? = null): UserDetails =
    object : UserDetailsWithTokenVersion, UserDetails by this {
        override val tokenVersion: Int = tokenVersion
        override val userId: String? = userId
    }
