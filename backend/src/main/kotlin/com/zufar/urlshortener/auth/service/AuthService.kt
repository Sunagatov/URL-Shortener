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
import com.zufar.urlshortener.auth.exception.EmailAlreadyExistsException
import com.zufar.urlshortener.auth.exception.EmailNotVerifiedException
import com.zufar.urlshortener.auth.exception.InvalidAuthRequestException
import com.zufar.urlshortener.auth.exception.InvalidTokenException
import com.zufar.urlshortener.auth.exception.InvalidVerificationCodeException
import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.auth.exception.VerificationResendTooSoonException
import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.auth.security.UserDetailsWithTokenVersion
import com.zufar.urlshortener.auth.security.withTokenVersion
import com.zufar.urlshortener.auth.validation.AuthRequestValidator
import com.zufar.urlshortener.shared.logging.LogSanitizer
import com.zufar.urlshortener.users.api.UserAccountRecord
import com.zufar.urlshortener.users.api.UserCredentialsReader
import com.zufar.urlshortener.users.api.UserRegistrationWriter
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.dao.DuplicateKeyException
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails as SecurityUserDetails
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.time.Clock
import java.time.Duration
import java.time.LocalDateTime

private const val INVALID_REFRESH_TOKEN_MESSAGE = "Invalid or expired refresh token"
private const val EMAIL_ALREADY_IN_USE_MESSAGE = "Email is already in use"
private const val EMAIL_NOT_VERIFIED_MESSAGE = "Please verify your email before signing in"
private const val EMAIL_ALREADY_VERIFIED_MESSAGE = "Email is already verified"
private const val INVALID_OR_EXPIRED_VERIFICATION_CODE_MESSAGE = "Invalid or expired verification code"
private const val VERIFICATION_RESEND_TOO_SOON_MESSAGE = "Verification code was sent recently. Please wait before requesting another one."
private const val VERIFICATION_CODE_BOUND = 1_000_000

@Service
class AuthService(
    private val authenticationManager: AuthenticationManager,
    private val authRequestValidator: AuthRequestValidator,
    private val userCredentialsReader: UserCredentialsReader,
    private val userRegistrationWriter: UserRegistrationWriter,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val emailVerificationNotifier: EmailVerificationNotifier,
    @Value($$"${app.auth.email-verification.enabled:false}") private val emailVerificationEnabled: Boolean,
    @Value($$"${app.auth.email-verification.expiration-minutes:10}") private val verificationExpirationMinutes: Long,
    @Value($$"${app.auth.email-verification.resend-cooldown-seconds:60}") private val verificationResendCooldownSeconds: Long,
    private val clock: Clock
) {
    private val log = LoggerFactory.getLogger(AuthService::class.java)
    private val random = SecureRandom()

    fun signIn(request: SignInRequest): AuthResponse {
        val normalizedRequest = request.copy(email = EmailNormalizer.normalize(request.email))
        authRequestValidator.validateAuthRequest(normalizedRequest)

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
            throw EmailNotVerifiedException(EMAIL_NOT_VERIFIED_MESSAGE)
        }

        log.info("auth_sign_in_succeeded userId={}", principal.userId ?: "unknown")
        return issueAuthentication(principal)
    }

    fun signUp(request: SignUpRequest): SignUpResponse {
        val normalizedRequest = request.copy(email = EmailNormalizer.normalize(request.email))
        authRequestValidator.validateSignUpRequest(normalizedRequest)
        ensureEmailIsAvailable(normalizedRequest.email)

        val now = LocalDateTime.now(clock)
        val encodedPassword = requireNotNull(passwordEncoder.encode(normalizedRequest.password)) {
            "Password encoder returned null during sign-up"
        }
        val user = UserAccountRecord(
            firstName = normalizedRequest.firstName,
            lastName = normalizedRequest.lastName,
            email = normalizedRequest.email,
            password = encodedPassword,
            country = normalizedRequest.country,
            age = normalizedRequest.age,
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

        val (pendingUser, verificationCode) = withFreshVerificationChallenge(user, now)
        val savedUser = saveUser(pendingUser)
        val deliveryMode = sendVerificationCode(savedUser.email, verificationCode)
        log.info(
            "auth_sign_up_completed userId={} verificationRequired={} deliveryMode={} emailDomain={}",
            savedUser.id,
            true,
            deliveryMode,
            LogSanitizer.emailDomain(savedUser.email)
        )
        return toSignUpResponse(savedUser, deliveryMode, now)
    }

    fun refreshAccessToken(request: RefreshTokenRequest): RefreshTokenResponse {
        authRequestValidator.validateRefreshTokenRequest(request)

        val refreshToken = request.refreshToken
        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw InvalidTokenException(INVALID_REFRESH_TOKEN_MESSAGE)
        }

        val user = findUserForRefreshToken(refreshToken)
        val tokenVersion = jwtTokenProvider.getTokenVersionFromJWT(refreshToken)
            ?: throw InvalidTokenException(INVALID_REFRESH_TOKEN_MESSAGE)

        if (tokenVersion != user.tokenVersion) {
            throw InvalidTokenException(INVALID_REFRESH_TOKEN_MESSAGE)
        }

        return RefreshTokenResponse(issueAccessToken(user))
    }

    fun verifyEmail(request: VerifyEmailRequest): AuthResponse {
        requireEmailVerificationEnabled()
        val normalizedRequest = request.copy(
            email = EmailNormalizer.normalize(request.email),
            code = request.code.trim()
        )
        authRequestValidator.validateVerifyEmailRequest(normalizedRequest)

        val user = userCredentialsReader.findByEmailIgnoreCase(normalizedRequest.email)
            ?: throw UserNotFoundException("User not found")

        if (user.emailVerified) {
            throw InvalidAuthRequestException(EMAIL_ALREADY_VERIFIED_MESSAGE)
        }

        val now = LocalDateTime.now(clock)
        val isValidCode = user.emailVerificationCodeHash != null &&
            user.emailVerificationCodeExpiresAt != null &&
            !user.emailVerificationCodeExpiresAt.isBefore(now) &&
            passwordEncoder.matches(normalizedRequest.code, user.emailVerificationCodeHash)
        if (!isValidCode) {
            throw InvalidVerificationCodeException(INVALID_OR_EXPIRED_VERIFICATION_CODE_MESSAGE)
        }

        val verifiedUser = userRegistrationWriter.save(
            user.copy(
                emailVerified = true,
                emailVerifiedAt = now,
                emailVerificationCodeHash = null,
                emailVerificationCodeExpiresAt = null,
                emailVerificationCodeSentAt = null,
                updatedAt = now
            )
        )
        log.info("auth_email_verified userId={} emailDomain={}", verifiedUser.id, LogSanitizer.emailDomain(verifiedUser.email))
        return issueAuthentication(verifiedUser)
    }

    fun resendVerificationCode(request: ResendVerificationRequest): VerificationChallengeResponse {
        requireEmailVerificationEnabled()
        val normalizedRequest = request.copy(email = EmailNormalizer.normalize(request.email))
        authRequestValidator.validateResendVerificationRequest(normalizedRequest)

        val user = userCredentialsReader.findByEmailIgnoreCase(normalizedRequest.email)
            ?: throw UserNotFoundException("User not found")
        if (user.emailVerified) {
            throw InvalidAuthRequestException(EMAIL_ALREADY_VERIFIED_MESSAGE)
        }

        val now = LocalDateTime.now(clock)
        val retryAfterSeconds = remainingResendCooldownSeconds(user, now)
        if (retryAfterSeconds > 0) {
            throw VerificationResendTooSoonException(VERIFICATION_RESEND_TOO_SOON_MESSAGE, retryAfterSeconds)
        }

        val (updatedUser, verificationCode) = withFreshVerificationChallenge(user, now)
        val savedUser = userRegistrationWriter.save(updatedUser)
        val deliveryMode = sendVerificationCode(savedUser.email, verificationCode)
        log.info(
            "auth_email_verification_resent userId={} deliveryMode={} emailDomain={}",
            savedUser.id,
            deliveryMode,
            LogSanitizer.emailDomain(savedUser.email)
        )
        return toVerificationChallengeResponse(savedUser, deliveryMode, now)
    }

    private fun ensureEmailIsAvailable(email: String) {
        if (userCredentialsReader.findByEmailIgnoreCase(email) != null) {
            throw EmailAlreadyExistsException(EMAIL_ALREADY_IN_USE_MESSAGE)
        }
    }

    private fun saveUser(user: UserAccountRecord): UserAccountRecord =
        try {
            userRegistrationWriter.save(user)
        } catch (_: DuplicateKeyException) {
            throw EmailAlreadyExistsException(EMAIL_ALREADY_IN_USE_MESSAGE)
        }

    private fun findUserForRefreshToken(refreshToken: String): UserAccountRecord {
        val normalizedEmail = EmailNormalizer.normalize(jwtTokenProvider.getUsernameFromJWT(refreshToken))
        return userCredentialsReader.findByEmailIgnoreCase(normalizedEmail)
            ?: throw UserNotFoundException("User not found for the provided refresh token")
    }

    private fun issueAuthentication(userDetails: SecurityUserDetails): AuthResponse =
        AuthResponse(
            accessToken = jwtTokenProvider.generateAccessToken(userDetails),
            refreshToken = jwtTokenProvider.generateRefreshToken(userDetails)
        )

    private fun issueAuthentication(userDetails: UserAccountRecord): AuthResponse =
        issueAuthentication(userDetails.toSecurityUser())

    private fun issueAccessToken(userDetails: UserAccountRecord): String =
        jwtTokenProvider.generateAccessToken(userDetails.toSecurityUser())

    private fun UserAccountRecord.toSecurityUser(): SecurityUserDetails =
        User(email, password, emptyList()).withTokenVersion(tokenVersion, id, emailVerified)

    private fun withFreshVerificationChallenge(user: UserAccountRecord, now: LocalDateTime): Pair<UserAccountRecord, String> {
        val code = generateVerificationCode()
        val codeHash = requireNotNull(passwordEncoder.encode(code)) {
            "Password encoder returned null during email verification code generation"
        }
        return user.copy(
            emailVerified = false,
            emailVerifiedAt = null,
            emailVerificationCodeHash = codeHash,
            emailVerificationCodeExpiresAt = now.plusMinutes(verificationExpirationMinutes),
            emailVerificationCodeSentAt = now,
            updatedAt = now
        ) to code
    }

    private fun sendVerificationCode(email: String, code: String): String =
        emailVerificationNotifier.sendCode(email, code, verificationExpirationMinutes)

    private fun toVerificationChallengeResponse(
        user: UserAccountRecord,
        deliveryMode: String,
        now: LocalDateTime
    ): VerificationChallengeResponse {
        val expiresAt = requireNotNull(user.emailVerificationCodeExpiresAt) {
            "Verification code expiration is missing"
        }
        return VerificationChallengeResponse(
            email = user.email,
            expiresInSeconds = Duration.between(now, expiresAt).seconds.coerceAtLeast(0),
            resendAvailableInSeconds = verificationResendCooldownSeconds,
            deliveryMode = deliveryMode
        )
    }

    private fun toSignUpResponse(
        user: UserAccountRecord,
        deliveryMode: String,
        now: LocalDateTime
    ): SignUpResponse {
        val challenge = toVerificationChallengeResponse(user, deliveryMode, now)
        return SignUpResponse(
            verificationRequired = true,
            email = challenge.email,
            expiresInSeconds = challenge.expiresInSeconds,
            resendAvailableInSeconds = challenge.resendAvailableInSeconds,
            deliveryMode = challenge.deliveryMode
        )
    }

    private fun requireEmailVerificationEnabled() {
        if (!emailVerificationEnabled) {
            throw InvalidAuthRequestException("Email verification is currently disabled")
        }
    }

    private fun remainingResendCooldownSeconds(user: UserAccountRecord, now: LocalDateTime): Long {
        val sentAt = user.emailVerificationCodeSentAt ?: return 0
        val resendAllowedAt = sentAt.plusSeconds(verificationResendCooldownSeconds)
        return Duration.between(now, resendAllowedAt).seconds.coerceAtLeast(0)
    }

    private fun generateVerificationCode(): String =
        random.nextInt(VERIFICATION_CODE_BOUND).toString().padStart(6, '0')
}
