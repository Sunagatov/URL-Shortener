package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.auth.security.withTokenVersion
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.logging.LogSanitizer
import com.zufar.urlshortener.users.entity.AuthProvider
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.security.core.userdetails.User
import org.springframework.stereotype.Service
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.RestTemplate
import java.time.Clock
import java.time.Instant

private const val GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
private const val GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
private const val GOOGLE_AUTH_FAILED_CODE = "GOOGLE_AUTH_FAILED"

@Service
class GoogleAuthService(
    private val userAccountRepository: UserAccountRepository,
    private val jwtTokenProvider: JwtTokenProvider,
    @Value("\${google.oauth.client-id}") private val clientId: String,
    @Value("\${google.oauth.client-secret}") private val clientSecret: String,
    @Value("\${google.oauth.redirect-uri}") private val redirectUri: String,
    private val clock: Clock
) {
    private val log = LoggerFactory.getLogger(GoogleAuthService::class.java)
    private val restTemplate = RestTemplate()

    fun authenticate(code: String): AuthResponse {
        val googleUser = exchangeCodeForUserInfo(code)
        val result = findOrCreateUser(googleUser)
        log.info(
            "google_auth_succeeded userId={} emailDomain={} isNewUser={}",
            result.user.id, LogSanitizer.emailDomain(result.user.email), result.isNewUser
        )
        return issueTokens(result.user)
    }

    private fun exchangeCodeForUserInfo(code: String): GoogleUserInfo {
        val tokens = exchangeCodeForTokens(code)
        return fetchUserInfo(tokens.accessToken)
    }

    private fun exchangeCodeForTokens(code: String): GoogleTokenResponse {
        val params = LinkedMultiValueMap<String, String>().apply {
            add("code", code)
            add("client_id", clientId)
            add("client_secret", clientSecret)
            add("redirect_uri", redirectUri)
            add("grant_type", "authorization_code")
        }
        val headers = HttpHeaders().apply { contentType = MediaType.APPLICATION_FORM_URLENCODED }
        val response = try {
            restTemplate.postForEntity(GOOGLE_TOKEN_URL, HttpEntity(params, headers), Map::class.java)
        } catch (e: Exception) {
            log.error("google_token_exchange_failed error={}", e.message)
            throw ApplicationException.unauthorized(GOOGLE_AUTH_FAILED_CODE, "Failed to exchange Google authorization code")
        }
        val body = response.body
            ?: throw ApplicationException.unauthorized(GOOGLE_AUTH_FAILED_CODE, "Empty response from Google token endpoint")
        val accessToken = body["access_token"] as? String
            ?: throw ApplicationException.unauthorized(GOOGLE_AUTH_FAILED_CODE, "No access token in Google response")
        return GoogleTokenResponse(accessToken)
    }

    @Suppress("UNCHECKED_CAST")
    private fun fetchUserInfo(accessToken: String): GoogleUserInfo {
        val headers = HttpHeaders().apply { setBearerAuth(accessToken) }
        val response = try {
            restTemplate.exchange(
                GOOGLE_USERINFO_URL, org.springframework.http.HttpMethod.GET,
                HttpEntity<Void>(headers), Map::class.java
            )
        } catch (e: Exception) {
            log.error("google_userinfo_failed error={}", e.message)
            throw ApplicationException.unauthorized(GOOGLE_AUTH_FAILED_CODE, "Failed to fetch Google user info")
        }
        val body = response.body
            ?: throw ApplicationException.unauthorized(GOOGLE_AUTH_FAILED_CODE, "Empty response from Google userinfo")
        val email = body["email"] as? String
            ?: throw ApplicationException.unauthorized(GOOGLE_AUTH_FAILED_CODE, "No email in Google profile")
        val emailVerified = body["email_verified"] as? Boolean ?: false
        if (!emailVerified) {
            throw ApplicationException.unauthorized(GOOGLE_AUTH_FAILED_CODE, "Google email is not verified")
        }
        return GoogleUserInfo(
            email = EmailNormalizer.normalize(email),
            firstName = (body["given_name"] as? String) ?: "",
            lastName = (body["family_name"] as? String) ?: ""
        )
    }

    private fun findOrCreateUser(googleUser: GoogleUserInfo): GoogleAuthUserResult {
        val existing = userAccountRepository.findByEmailIgnoreCase(googleUser.email)
        if (existing != null) {
            return GoogleAuthUserResult(verifyExistingAccountFromGoogle(existing), isNewUser = false)
        }
        val now = Instant.now(clock)
        val user = userAccountRepository.save(
            UserAccountDocument(
                firstName = googleUser.firstName,
                lastName = googleUser.lastName,
                email = googleUser.email,
                authProvider = AuthProvider.GOOGLE,
                emailVerified = true,
                emailVerifiedAt = now,
                createdAt = now,
                updatedAt = now
            )
        )
        return GoogleAuthUserResult(user, isNewUser = true)
    }

    private fun verifyExistingAccountFromGoogle(user: UserAccountDocument): UserAccountDocument {
        if (user.emailVerified &&
            user.emailVerificationCodeHash == null &&
            user.emailVerificationCodeExpiresAt == null &&
            user.emailVerificationCodeSentAt == null
        ) {
            return user
        }

        val now = Instant.now(clock)
        return userAccountRepository.save(
            user.copy(
                emailVerified = true,
                emailVerifiedAt = user.emailVerifiedAt ?: now,
                emailVerificationCodeHash = null,
                emailVerificationCodeExpiresAt = null,
                emailVerificationCodeSentAt = null,
                updatedAt = now
            )
        )
    }

    private fun issueTokens(user: UserAccountDocument): AuthResponse {
        val userDetails = User(user.email, user.password ?: "", emptyList())
            .withTokenVersion(user.tokenVersion, user.id, user.emailVerified)
        return AuthResponse(
            accessToken = jwtTokenProvider.generateAccessToken(userDetails),
            refreshToken = jwtTokenProvider.generateRefreshToken(userDetails)
        )
    }

    private data class GoogleTokenResponse(val accessToken: String)

    private data class GoogleUserInfo(
        val email: String,
        val firstName: String,
        val lastName: String
    )

    private data class GoogleAuthUserResult(
        val user: UserAccountDocument,
        val isNewUser: Boolean
    )
}
