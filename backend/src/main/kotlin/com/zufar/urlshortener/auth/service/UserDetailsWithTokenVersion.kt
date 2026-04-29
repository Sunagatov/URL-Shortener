package com.zufar.urlshortener.auth.service

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

class UserDetailsWithTokenVersion(
    private val delegate: UserDetails,
    val tokenVersion: Int
) : UserDetails by delegate {
    override fun getAuthorities(): MutableCollection<out GrantedAuthority> = delegate.authorities
}

fun UserDetails.withTokenVersion(tokenVersion: Int): UserDetailsWithTokenVersion =
    UserDetailsWithTokenVersion(this, tokenVersion)
