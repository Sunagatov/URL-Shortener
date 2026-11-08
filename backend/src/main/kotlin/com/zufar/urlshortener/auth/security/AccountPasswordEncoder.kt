package com.zufar.urlshortener.auth.security

import org.springframework.security.crypto.argon2.Argon2PasswordEncoder
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.DelegatingPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import com.zufar.urlshortener.shared.security.PasswordPolicy

/** New hashes use Argon2id; existing unprefixed bcrypt passwords and challenges remain readable. */
class AccountPasswordEncoder : PasswordEncoder {
    private val argon = Argon2PasswordEncoder(16, 32, 1, 19456, 2)
    private val normalized = object : PasswordEncoder {
        override fun encode(rawPassword: CharSequence?): String = argon.encode(PasswordPolicy.normalize(requireNotNull(rawPassword).toString()))!!
        override fun matches(rawPassword: CharSequence?, encodedPassword: String?): Boolean =
            rawPassword != null && argon.matches(PasswordPolicy.normalize(rawPassword.toString()), encodedPassword)
    }
    private val delegate = DelegatingPasswordEncoder("argon2id-nfc", mapOf(
        "argon2id-nfc" to normalized,
        "argon2id" to Argon2PasswordEncoder(16, 32, 1, 19456, 2),
        "bcrypt" to BCryptPasswordEncoder()
    )).apply { setDefaultPasswordEncoderForMatches(BCryptPasswordEncoder()) }

    override fun encode(rawPassword: CharSequence?): String = requireNotNull(delegate.encode(requireNotNull(rawPassword)))
    override fun matches(rawPassword: CharSequence?, encodedPassword: String?): Boolean =
        rawPassword != null && encodedPassword != null &&
            try { delegate.matches(rawPassword, encodedPassword) } catch (_: IllegalArgumentException) { false }
    override fun upgradeEncoding(encodedPassword: String?): Boolean = delegate.upgradeEncoding(encodedPassword)
}
