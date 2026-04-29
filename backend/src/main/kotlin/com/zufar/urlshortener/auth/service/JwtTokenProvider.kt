package com.zufar.urlshortener.auth.service

import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component
import java.util.Date
import javax.crypto.SecretKey

private const val MIN_JWT_SECRET_BYTES = 32
private const val TOKEN_VERSION_CLAIM = "tokenVersion"

@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}") private val jwtSecret: String,
    @Value("\${jwt.accessTokenExpiration}") private val jwtExpirationInMs: Long,
    @Value("\${jwt.refreshTokenExpiration}") private val jwtRefreshExpirationInMs: Long
) {
    companion object {
        private const val TOKEN_TYPE_CLAIM = "type"
        private const val ACCESS_TOKEN_TYPE = "access"
        private const val REFRESH_TOKEN_TYPE = "refresh"
    }

    private val secretKey: SecretKey

    init {
        val secretBytes = jwtSecret.toByteArray(Charsets.UTF_8)
        require(secretBytes.size >= MIN_JWT_SECRET_BYTES) {
            "JWT secret must be at least 256 bits (32 bytes). Set the JWT_SECRET environment variable."
        }
        secretKey = Keys.hmacShaKeyFor(secretBytes)
    }

    fun generateAccessToken(userDetails: UserDetails): String =
        generateToken(userDetails, jwtExpirationInMs, ACCESS_TOKEN_TYPE)

    fun generateRefreshToken(userDetails: UserDetails): String =
        generateToken(userDetails, jwtRefreshExpirationInMs, REFRESH_TOKEN_TYPE)

    fun getUsernameFromJWT(token: String): String = parseClaims(token).subject

    fun getTokenVersionFromJWT(token: String): Int? =
        when (val value = parseClaims(token)[TOKEN_VERSION_CLAIM]) {
            is Int -> value
            is Number -> value.toInt()
            else -> null
        }

    fun getUsernameFromValidAccessToken(token: String): String? =
        parseClaimsOrNull(token)
            ?.takeIf { (it[TOKEN_TYPE_CLAIM] as? String) == ACCESS_TOKEN_TYPE }
            ?.subject

    fun validateAccessToken(token: String): Boolean = validateTokenByType(token, ACCESS_TOKEN_TYPE)

    fun validateRefreshToken(token: String): Boolean = validateTokenByType(token, REFRESH_TOKEN_TYPE)

    private fun generateToken(userDetails: UserDetails, expirationMs: Long, tokenType: String): String {
        val now = Date()
        val expiryDate = Date(now.time + expirationMs)
        val tokenVersion = extractTokenVersion(userDetails)

        return Jwts.builder()
            .subject(userDetails.username)
            .claim(TOKEN_TYPE_CLAIM, tokenType)
            .claim(TOKEN_VERSION_CLAIM, tokenVersion)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey)
            .compact()
    }

    private fun parseClaims(token: String) = Jwts.parser()
        .verifyWith(secretKey)
        .build()
        .parseSignedClaims(token)
        .payload

    private fun validateTokenByType(token: String, expectedType: String): Boolean =
        parseClaimsOrNull(token)?.let { (it[TOKEN_TYPE_CLAIM] as? String) == expectedType } ?: false

    private fun parseClaimsOrNull(token: String) =
        try {
            parseClaims(token)
        } catch (_: JwtException) {
            null
        } catch (_: IllegalArgumentException) {
            null
        }

    private fun extractTokenVersion(userDetails: UserDetails): Int {
        return (userDetails as? UserDetailsWithTokenVersion)?.tokenVersion ?: 0
    }
}
