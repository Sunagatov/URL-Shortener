package com.zufar.urlshortener.auth.service

import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey
import org.springframework.security.core.userdetails.UserDetails

@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}") private val jwtSecret: String,
    @Value("\${jwt.accessTokenExpiration}") private val jwtExpirationInMs: Long,
    @Value("\${jwt.refreshTokenExpiration}") private val jwtRefreshExpirationInMs: Long
) {
    private val secretKey: SecretKey = Keys.hmacShaKeyFor(jwtSecret.toByteArray())

    fun generateAccessToken(userDetails: UserDetails): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtExpirationInMs)
        return Jwts.builder()
            .subject(userDetails.username)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey)
            .compact()
    }

    fun generateRefreshToken(userDetails: UserDetails): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtRefreshExpirationInMs)
        return Jwts.builder()
            .subject(userDetails.username)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey)
            .compact()
    }

    fun getUsernameFromJWT(token: String): String {
        val claims = Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .payload
        return claims.subject
    }

    fun validateToken(authToken: String): Boolean {
        try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(authToken)
            return true
        } catch (ex: Exception) {
            // Log the exception or handle it accordingly
        }
        return false
    }
}
