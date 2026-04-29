package com.zufar.urlshortener.auth.service.support

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.entity.UserDetails as AuthUserDetails
import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.auth.security.withTokenVersion
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service

@Service
class AuthTokenIssuer(
    private val jwtTokenProvider: JwtTokenProvider
) {

    fun issueAuthentication(userDetails: UserDetails): AuthResponse {
        val accessToken = jwtTokenProvider.generateAccessToken(userDetails)
        val refreshToken = jwtTokenProvider.generateRefreshToken(userDetails)
        return AuthResponse(accessToken, refreshToken)
    }

    fun issueAuthentication(userDetails: AuthUserDetails): AuthResponse =
        issueAuthentication(userDetails.toSecurityUser())

    fun issueAccessToken(userDetails: AuthUserDetails): String =
        jwtTokenProvider.generateAccessToken(userDetails.toSecurityUser())

    private fun AuthUserDetails.toSecurityUser(): UserDetails =
        org.springframework.security.core.userdetails.User(email, password, emptyList()).withTokenVersion(tokenVersion)
}
