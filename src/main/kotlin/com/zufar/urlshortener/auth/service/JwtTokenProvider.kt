package com.zufar.urlshortener.auth.service

import io.jsonwebtoken.JwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component
import java.util.Date
import javax.crypto.SecretKey

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

    private val secretKey: SecretKey = Keys.hmacShaKeyFor(jwtSecret.toByteArray())

    fun generateAccessToken(userDetails: UserDetails): String =
        generateToken(userDetails, jwtExpirationInMs, ACCESS_TOKEN_TYPE)

    fun generateRefreshToken(userDetails: UserDetails): String =
        generateToken(userDetails, jwtRefreshExpirationInMs, REFRESH_TOKEN_TYPE)

    fun getUsernameFromJWT(token: String): String = parseClaims(token).subject

    fun validateAccessToken(token: String): Boolean = validateTokenByType(token, ACCESS_TOKEN_TYPE)

    fun validateRefreshToken(token: String): Boolean = validateTokenByType(token, REFRESH_TOKEN_TYPE)

    private fun generateToken(userDetails: UserDetails, expirationMs: Long, tokenType: String): String {
        val now = Date()
        val expiryDate = Date(now.time + expirationMs)

        return Jwts.builder()
            .subject(userDetails.username)
            .claim(TOKEN_TYPE_CLAIM, tokenType)
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

    private fun validateTokenByType(token: String, expectedType: String): Boolean {
        return try {
            val claims = parseClaims(token)
            (claims[TOKEN_TYPE_CLAIM] as? String) == expectedType
        } catch (_: JwtException) {
            false
        } catch (_: IllegalArgumentException) {
            false
        }
    }
}
