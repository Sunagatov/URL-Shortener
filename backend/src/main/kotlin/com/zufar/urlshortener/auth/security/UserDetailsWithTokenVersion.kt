package com.zufar.urlshortener.auth.security

import org.springframework.security.core.userdetails.UserDetails

interface UserDetailsWithTokenVersion : UserDetails {
    val tokenVersion: Int
}

fun UserDetails.withTokenVersion(tokenVersion: Int): UserDetails =
    object : UserDetailsWithTokenVersion, UserDetails by this {
        override val tokenVersion: Int = tokenVersion
    }
