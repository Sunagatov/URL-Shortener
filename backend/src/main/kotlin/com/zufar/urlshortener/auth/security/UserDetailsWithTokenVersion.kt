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
        override fun getUsername(): String = this@withTokenVersion.username
        override fun getPassword(): String = requireNotNull(this@withTokenVersion.password)
        override fun getAuthorities() = this@withTokenVersion.authorities
        override fun isAccountNonExpired(): Boolean = this@withTokenVersion.isAccountNonExpired
        override fun isAccountNonLocked(): Boolean = this@withTokenVersion.isAccountNonLocked
        override fun isCredentialsNonExpired(): Boolean = this@withTokenVersion.isCredentialsNonExpired
        override fun isEnabled(): Boolean = this@withTokenVersion.isEnabled
    }
