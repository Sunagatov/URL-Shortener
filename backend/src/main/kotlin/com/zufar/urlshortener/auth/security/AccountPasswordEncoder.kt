package com.zufar.urlshortener.auth.security

import org.springframework.security.crypto.argon2.Argon2PasswordEncoder
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.DelegatingPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder

/** New hashes use Argon2id; existing unprefixed bcrypt passwords and challenges remain readable. */
class AccountPasswordEncoder : PasswordEncoder {
    private val delegate = DelegatingPasswordEncoder("argon2id", mapOf(
        "argon2id" to Argon2PasswordEncoder(16, 32, 1, 19456, 2),
        "bcrypt" to BCryptPasswordEncoder()
    )).apply { setDefaultPasswordEncoderForMatches(BCryptPasswordEncoder()) }

    override fun encode(rawPassword: CharSequence?): String = requireNotNull(delegate.encode(requireNotNull(rawPassword)))
    override fun matches(rawPassword: CharSequence?, encodedPassword: String?): Boolean =
        rawPassword != null && encodedPassword != null &&
            try { delegate.matches(rawPassword, encodedPassword) } catch (_: IllegalArgumentException) { false }
    override fun upgradeEncoding(encodedPassword: String?): Boolean = delegate.upgradeEncoding(encodedPassword)
}
