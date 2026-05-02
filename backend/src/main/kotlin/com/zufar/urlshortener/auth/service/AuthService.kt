package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.AuthResponse
import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenResponse
import com.zufar.urlshortener.auth.dto.ResendVerificationRequest
import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.auth.dto.SignUpResponse
import com.zufar.urlshortener.auth.dto.VerificationChallengeResponse
import com.zufar.urlshortener.auth.dto.VerifyEmailRequest
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.auth.security.UserDetailsWithTokenVersion
import com.zufar.urlshortener.auth.security.withTokenVersion
import com.zufar.urlshortener.shared.logging.LogSanitizer
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.entity.AuthProvider
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.dao.DuplicateKeyException
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails as SecurityUserDetails
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.LocalDateTime

private const val INVALID_REFRESH_TOKEN_MESSAGE = "Invalid or expired refresh token"
private const val INVALID_TOKEN_CODE = "INVALID_TOKEN"
private const val EMAIL_ALREADY_IN_USE_MESSAGE = "Email is already in use"
private const val EMAIL_ALREADY_EXISTS_CODE = "EMAIL_ALREADY_EXISTS"
private const val EMAIL_NOT_VERIFIED_MESSAGE = "Please verify your email before signing in"
private const val EMAIL_NOT_VERIFIED_CODE = "EMAIL_NOT_VERIFIED"
private const val USER_NOT_FOUND_CODE = "USER_NOT_FOUND"

@Service
class AuthService(
    private val authenticationManager: AuthenticationManager,
    private val userAccountRepository: UserAccountRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val emailVerificationNotifier: EmailVerificationNotifier,
    @Value($$"${app.auth.email-verification.enabled:false}") private val emailVerificationEnabled: Boolean,
    @Value($$"${app.auth.email-verification.expiration-minutes:10}") private val verificationExpirationMinutes: Long,
    @Value($$"${app.auth.email-verification.resend-cooldown-seconds:60}") private val verificationResendCooldownSeconds: Long,
    private val clock: Clock
) {
    private val log = LoggerFactory.getLogger(AuthService::class.java)
    private val emailVerificationWorkflow = EmailVerificationWorkflow(
        userAccountRepository = userAccountRepository,
        passwordEncoder = passwordEncoder,
        emailVerificationNotifier = emailVerificationNotifier,
        emailVerificationEnabled = emailVerificationEnabled,
        verificationExpirationMinutes = verificationExpirationMinutes,
        verificationResendCooldownSeconds = verificationResendCooldownSeconds,
        clock = clock
    )

    fun signIn(request: SignInRequest): AuthResponse {
        val normalizedRequest = request.copy(email = EmailNormalizer.normalize(request.email))

        val authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(normalizedRequest.email, request.password)
        )
        val principal = authentication.principal as UserDetailsWithTokenVersion
        if (!principal.emailVerified) {
            log.info(
                "auth_sign_in_blocked_unverified maskedEmail={} emailDomain={}",
                LogSanitizer.maskEmail(normalizedRequest.email),
                LogSanitizer.emailDomain(normalizedRequest.email)
            )
            throw ApplicationException.forbidden(EMAIL_NOT_VERIFIED_CODE, EMAIL_NOT_VERIFIED_MESSAGE)
        }

        log.info("auth_sign_in_succeeded userId={}", principal.userId ?: "unknown")
        return issueAuthentication(principal)
    }

    fun signUp(request: SignUpRequest): SignUpResponse {
        val normalizedRequest = request.copy(email = EmailNormalizer.normalize(request.email))
        ensureEmailIsAvailable(normalizedRequest.email)

        val now = LocalDateTime.now(clock)
        val encodedPassword = requireNotNull(passwordEncoder.encode(normalizedRequest.password)) {
            "Password encoder returned null during sign-up"
        }
        val user = UserAccountDocument(
            firstName = normalizedRequest.firstName,
            lastName = normalizedRequest.lastName,
            email = normalizedRequest.email,
            password = encodedPassword,
            country = normalizedRequest.country,
            age = normalizedRequest.age,
            authProvider = AuthProvider.LOCAL,
            createdAt = now,
            updatedAt = now
        )

        if (!emailVerificationEnabled) {
            val savedUser = saveUser(user.copy(emailVerified = true, emailVerifiedAt = now))
            log.info("auth_sign_up_completed userId={} verificationRequired={}", savedUser.id, false)
            val authResponse = issueAuthentication(savedUser)
            return SignUpResponse(
                verificationRequired = false,
                accessToken = authResponse.accessToken,
                refreshToken = authResponse.refreshToken
            )
        }

        val (pendingUser, verificationCode) = emailVerificationWorkflow.createChallenge(user, now)
        val savedUser = saveUser(pendingUser)
        val deliveryMode = emailVerificationWorkflow.sendVerificationCode(savedUser.email, verificationCode)
        log.info(
            "auth_sign_up_completed userId={} verificationRequired={} deliveryMode={} emailDomain={}",
            savedUser.id,
            true,
            deliveryMode,
            LogSanitizer.emailDomain(savedUser.email)
        )
        return emailVerificationWorkflow.toSignUpResponse(savedUser, deliveryMode, now)
    }

    fun refreshAccessToken(request: RefreshTokenRequest): RefreshTokenResponse {
        val refreshToken = request.refreshToken
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw ApplicationException.unauthorized(INVALID_TOKEN_CODE, INVALID_REFRESH_TOKEN_MESSAGE)
        }

        val user = findUserForRefreshToken(refreshToken)
        val tokenVersion = jwtTokenProvider.getTokenVersionFromJWT(refreshToken)
            ?: throw ApplicationException.unauthorized(INVALID_TOKEN_CODE, INVALID_REFRESH_TOKEN_MESSAGE)

        if (tokenVersion != user.tokenVersion) {
            throw ApplicationException.unauthorized(INVALID_TOKEN_CODE, INVALID_REFRESH_TOKEN_MESSAGE)
        }

        return RefreshTokenResponse(issueAccessToken(user))
    }

    fun verifyEmail(request: VerifyEmailRequest): AuthResponse {
        return issueAuthentication(emailVerificationWorkflow.verifyEmail(request))
    }

    fun resendVerificationCode(request: ResendVerificationRequest): VerificationChallengeResponse {
        return emailVerificationWorkflow.resendVerificationCode(request)
    }

    private fun ensureEmailIsAvailable(email: String) {
        if (userAccountRepository.findByEmailIgnoreCase(email) != null) {
            throw ApplicationException.conflict(EMAIL_ALREADY_EXISTS_CODE, EMAIL_ALREADY_IN_USE_MESSAGE)
        }
    }

    private fun saveUser(user: UserAccountDocument): UserAccountDocument =
        try {
            userAccountRepository.save(user)
        } catch (_: DuplicateKeyException) {
            throw ApplicationException.conflict(EMAIL_ALREADY_EXISTS_CODE, EMAIL_ALREADY_IN_USE_MESSAGE)
        }

    private fun findUserForRefreshToken(refreshToken: String): UserAccountDocument {
        val normalizedEmail = EmailNormalizer.normalize(jwtTokenProvider.getUsernameFromJWT(refreshToken))
        return userAccountRepository.findByEmailIgnoreCase(normalizedEmail)
            ?: throw ApplicationException.notFound(USER_NOT_FOUND_CODE, "User not found for the provided refresh token")
    }

    private fun issueAuthentication(userDetails: SecurityUserDetails): AuthResponse =
        AuthResponse(
            accessToken = jwtTokenProvider.generateAccessToken(userDetails),
            refreshToken = jwtTokenProvider.generateRefreshToken(userDetails)
        )

    private fun issueAuthentication(userDetails: UserAccountDocument): AuthResponse =
        issueAuthentication(userDetails.toSecurityUser())

    private fun issueAccessToken(userDetails: UserAccountDocument): String =
        jwtTokenProvider.generateAccessToken(userDetails.toSecurityUser())

    private fun UserAccountDocument.toSecurityUser(): SecurityUserDetails =
        User(email, password, emptyList()).withTokenVersion(tokenVersion, id, emailVerified)
}
