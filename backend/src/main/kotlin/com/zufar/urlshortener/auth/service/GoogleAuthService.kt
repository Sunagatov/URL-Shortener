package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.auth.security.withTokenVersion
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.logging.LogSanitizer
import com.zufar.urlshortener.users.entity.AuthProvider
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import com.zufar.urlshortener.users.repository.updateAccountOrConflict
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

    fun authenticate(code: String, codeVerifier: String, linkAccessToken: String? = null): AuthResponse {
        if (!codeVerifier.matches(Regex("[A-Za-z0-9._~-]{43,128}"))) {
            throw ApplicationException.unauthorized(GOOGLE_AUTH_FAILED_CODE, "Invalid sign-in transaction")
        }
        val googleUser = exchangeCodeForUserInfo(code, codeVerifier)
        val result = findOrCreateUser(googleUser, linkAccessToken)
        log.info(
            "google_auth_succeeded userId={} emailDomain={} isNewUser={}",
            result.user.id, LogSanitizer.emailDomain(result.user.email), result.isNewUser
        )
        return issueTokens(result.user)
    }

    private fun exchangeCodeForUserInfo(code: String, codeVerifier: String): GoogleUserInfo {
        val tokens = exchangeCodeForTokens(code, codeVerifier)
        return fetchUserInfo(tokens.accessToken)
    }

    private fun exchangeCodeForTokens(code: String, codeVerifier: String): GoogleTokenResponse {
        val params = LinkedMultiValueMap<String, String>().apply {
            add("code", code)
            add("code_verifier", codeVerifier)
            add("client_id", clientId)
            add("client_secret", clientSecret)
            add("redirect_uri", redirectUri)
            add("grant_type", "authorization_code")
        }
        val headers = HttpHeaders().apply { contentType = MediaType.APPLICATION_FORM_URLENCODED }
        val response = try {
            restTemplate.postForEntity(GOOGLE_TOKEN_URL, HttpEntity(params, headers), Map::class.java)
        } catch (e: Exception) {
            log.error("google_token_exchange_failed errorType={}", e.javaClass.simpleName)
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
            log.error("google_userinfo_failed errorType={}", e.javaClass.simpleName)
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
        val subject = (body["sub"] as? String)?.takeIf { it.isNotBlank() && it.length <= 255 }
            ?: throw ApplicationException.unauthorized(GOOGLE_AUTH_FAILED_CODE, "Missing Google account identifier")
        val normalizedEmail = EmailNormalizer.normalize(email)
        val hostedDomain = (body["hd"] as? String)?.lowercase()?.takeIf { it.isNotBlank() }
        return GoogleUserInfo(
            email = normalizedEmail,
            subject = subject,
            authoritativeEmail = normalizedEmail.endsWith("@gmail.com") ||
                (hostedDomain != null && normalizedEmail.substringAfterLast('@') == hostedDomain),
            firstName = (body["given_name"] as? String) ?: "",
            lastName = (body["family_name"] as? String) ?: ""
        )
    }

    private fun findOrCreateUser(googleUser: GoogleUserInfo, linkAccessToken: String?): GoogleAuthUserResult {
        userAccountRepository.findByGoogleSubject(googleUser.subject)?.let { bound ->
            if (!bound.emailVerified) throw linkingProofRequired()
            // A provider email change never reassigns an established subject binding.
            if (linkAccessToken != null) requireLinkProof(bound, linkAccessToken)
            return GoogleAuthUserResult(bound, isNewUser = false)
        }
        val existing = userAccountRepository.findByEmailIgnoreCase(googleUser.email)
        if (existing != null) {
            if (existing.googleSubject != null) throw linkingProofRequired()
            if (linkAccessToken != null) requireLinkProof(existing, linkAccessToken)
            else if (!googleUser.authoritativeEmail) throw linkingProofRequired()
            return GoogleAuthUserResult(verifyExistingAccountFromGoogle(existing, googleUser.subject), isNewUser = false)
        }
        // Third-party Google email verification can be historical. Establish mailbox ownership
        // through ordinary email signup/recovery, then explicitly link from a fresh local session.
        if (!googleUser.authoritativeEmail || linkAccessToken != null) throw linkingProofRequired()
        val now = Instant.now(clock)
        val user = userAccountRepository.save(
            UserAccountDocument(
                firstName = googleUser.firstName,
                lastName = googleUser.lastName,
                email = googleUser.email,
                authProvider = AuthProvider.GOOGLE,
                googleSubject = googleUser.subject,
                emailVerified = true,
                emailVerifiedAt = now,
                createdAt = now,
                updatedAt = now
            )
        )
        return GoogleAuthUserResult(user, isNewUser = true)
    }

    private fun requireLinkProof(user: UserAccountDocument, token: String) {
        if (!jwtTokenProvider.isRecentAccessToken(token, 300) ||
            jwtTokenProvider.getTokenVersionFromJWT(token) != user.tokenVersion ||
            EmailNormalizer.normalize(jwtTokenProvider.getUsernameFromJWT(token)) != EmailNormalizer.normalize(user.email) ||
            !user.emailVerified || !user.passwordEmailVerified || user.password == null
        ) throw linkingProofRequired()
    }

    private fun linkingProofRequired() = ApplicationException.forbidden(
        "GOOGLE_LINK_REQUIRES_PROOF",
        "Sign up or sign in with email first. If needed, reset your password. Then link Google from Security within five minutes of signing in."
    )

    private fun verifyExistingAccountFromGoogle(user: UserAccountDocument, subject: String): UserAccountDocument {
        val removeUntrustedPassword = user.password != null && !user.passwordEmailVerified
        if (user.googleSubject == subject && user.emailVerified && !removeUntrustedPassword &&
            user.emailVerificationCodeHash == null &&
            user.emailVerificationCodeExpiresAt == null &&
            user.emailVerificationCodeSentAt == null
        ) {
            return user
        }

        val now = Instant.now(clock)
        return userAccountRepository.updateAccountOrConflict(user,
            user.copy(
                googleSubject = subject,
                password = if (removeUntrustedPassword) null else user.password,
                authProvider = if (removeUntrustedPassword) AuthProvider.GOOGLE else user.authProvider,
                tokenVersion = if (removeUntrustedPassword) user.tokenVersion + 1 else user.tokenVersion,
                passwordResetTokenHash = null,
                passwordResetTokenId = null,
                passwordResetTokenExpiresAt = null,
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
        val subject: String,
        val authoritativeEmail: Boolean,
        val firstName: String,
        val lastName: String
    )

    private data class GoogleAuthUserResult(
        val user: UserAccountDocument,
        val isNewUser: Boolean
    )
}
