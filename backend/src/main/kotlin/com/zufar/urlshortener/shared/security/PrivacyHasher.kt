package com.zufar.urlshortener.shared.security

import java.security.MessageDigest

object PrivacyHasher {
    fun sha256(value: String?): String? {
        if (value.isNullOrBlank()) return null
        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(value.toByteArray()).joinToString("") { "%02x".format(it) }
    }
}
