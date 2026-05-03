package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.ResendVerificationRequest
import com.zufar.urlshortener.auth.dto.SignUpResponse
import com.zufar.urlshortener.auth.dto.VerificationChallengeResponse
import com.zufar.urlshortener.auth.dto.VerifyEmailRequest
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.logging.LogSanitizer
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import java.security.SecureRandom
import java.time.Clock
import java.time.Duration
import java.time.Instant

private const val EMAIL_ALREADY_VERIFIED_MESSAGE = "Email is already verified"
private const val INVALID_AUTH_REQUEST_CODE = "INVALID_AUTH_REQUEST"
private const val INVALID_OR_EXPIRED_VERIFICATION_CODE_MESSAGE = "Invalid or expired verification code"
private const val INVALID_VERIFICATION_CODE = "INVALID_VERIFICATION_CODE"
private const val VERIFICATION_RESEND_TOO_SOON_MESSAGE = "Verification code was sent recently. Please wait before requesting another one."
private const val VERIFICATION_RESEND_TOO_SOON_CODE = "VERIFICATION_RESEND_TOO_SOON"
private const val EMAIL_VERIFICATION_DISABLED_MESSAGE = "Email verification is currently disabled"
private const val USER_NOT_FOUND_CODE = "USER_NOT_FOUND"
private const val VERIFICATION_CODE_BOUND = 1_000_000

internal class EmailVerificationWorkflow(
    private val userAccountRepository: UserAccountRepository,
    private val passwordEncoder: PasswordEncoder,
    private val emailVerificationNotifier: EmailVerificationNotifier,
    private val emailVerificationEnabled: Boolean,
    private val verificationExpirationMinutes: Long,
    private val verificationResendCooldownSeconds: Long,
    private val clock: Clock,
    private val random: SecureRandom = SecureRandom()
) {
    private val log = LoggerFactory.getLogger(EmailVerificationWorkflow::class.java)

    fun createChallenge(user: UserAccountDocument, now: Instant): Pair<UserAccountDocument, String> {
        val code = generateVerificationCode()
        val codeHash = requireNotNull(passwordEncoder.encode(code)) {
            "Password encoder returned null during email verification code generation"
        }
        return user.copy(
            emailVerified = false,
            emailVerifiedAt = null,
            emailVerificationCodeHash = codeHash,
            emailVerificationCodeExpiresAt = now.plusSeconds(verificationExpirationMinutes * 60),
            emailVerificationCodeSentAt = now,
            updatedAt = now
        ) to code
    }

    fun verifyEmail(request: VerifyEmailRequest): UserAccountDocument {
        requireEnabled()
        val normalizedRequest = request.copy(
            email = EmailNormalizer.normalize(request.email),
            code = request.code.trim()
        )

        val user = userAccountRepository.findByEmailIgnoreCase(normalizedRequest.email)
            ?: throw ApplicationException.notFound(USER_NOT_FOUND_CODE, "User not found")
        if (user.emailVerified) {
            throw ApplicationException.badRequest(INVALID_AUTH_REQUEST_CODE, EMAIL_ALREADY_VERIFIED_MESSAGE)
        }

        val now = Instant.now(clock)
        val isValidCode = user.emailVerificationCodeHash != null &&
            user.emailVerificationCodeExpiresAt != null &&
            !user.emailVerificationCodeExpiresAt.isBefore(now) &&
            passwordEncoder.matches(normalizedRequest.code, user.emailVerificationCodeHash)
        if (!isValidCode) {
            throw ApplicationException.badRequest(INVALID_VERIFICATION_CODE, INVALID_OR_EXPIRED_VERIFICATION_CODE_MESSAGE)
        }

        val verifiedUser = userAccountRepository.save(
            user.copy(
                emailVerified = true,
                emailVerifiedAt = now,
                emailVerificationCodeHash = null,
                emailVerificationCodeExpiresAt = null,
                emailVerificationCodeSentAt = null,
                updatedAt = now
            )
        )
        log.info(
            "auth_email_verified userId={} emailDomain={}",
            verifiedUser.id,
            LogSanitizer.emailDomain(verifiedUser.email)
        )
        return verifiedUser
    }

    fun resendVerificationCode(request: ResendVerificationRequest): VerificationChallengeResponse {
        requireEnabled()
        val normalizedRequest = request.copy(email = EmailNormalizer.normalize(request.email))

        val user = userAccountRepository.findByEmailIgnoreCase(normalizedRequest.email)
            ?: throw ApplicationException.notFound(USER_NOT_FOUND_CODE, "User not found")
        if (user.emailVerified) {
            throw ApplicationException.badRequest(INVALID_AUTH_REQUEST_CODE, EMAIL_ALREADY_VERIFIED_MESSAGE)
        }

        val now = Instant.now(clock)
        val retryAfterSeconds = remainingResendCooldownSeconds(user, now)
        if (retryAfterSeconds > 0) {
            throw ApplicationException.tooManyRequests(
                VERIFICATION_RESEND_TOO_SOON_CODE,
                VERIFICATION_RESEND_TOO_SOON_MESSAGE,
                retryAfterSeconds
            )
        }

        val (updatedUser, verificationCode) = createChallenge(user, now)
        val savedUser = userAccountRepository.save(updatedUser)
        val deliveryMode = sendVerificationCode(savedUser.email, verificationCode)
        log.info(
            "auth_email_verification_resent userId={} deliveryMode={} emailDomain={}",
            savedUser.id,
            deliveryMode,
            LogSanitizer.emailDomain(savedUser.email)
        )
        return toChallengeResponse(savedUser, deliveryMode, now)
    }

    fun toSignUpResponse(user: UserAccountDocument, deliveryMode: String, now: Instant): SignUpResponse {
        val challenge = toChallengeResponse(user, deliveryMode, now)
        return SignUpResponse(
            verificationRequired = true,
            email = challenge.email,
            expiresInSeconds = challenge.expiresInSeconds,
            resendAvailableInSeconds = challenge.resendAvailableInSeconds,
            deliveryMode = challenge.deliveryMode
        )
    }

    fun sendVerificationCode(email: String, code: String): String =
        emailVerificationNotifier.sendCode(email, code, verificationExpirationMinutes)

    private fun toChallengeResponse(
        user: UserAccountDocument,
        deliveryMode: String,
        now: Instant
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

    private fun requireEnabled() {
        if (!emailVerificationEnabled) {
            throw ApplicationException.badRequest(INVALID_AUTH_REQUEST_CODE, EMAIL_VERIFICATION_DISABLED_MESSAGE)
        }
    }

    private fun remainingResendCooldownSeconds(user: UserAccountDocument, now: Instant): Long {
        val sentAt = user.emailVerificationCodeSentAt ?: return 0
        val resendAllowedAt = sentAt.plusSeconds(verificationResendCooldownSeconds)
        return Duration.between(now, resendAllowedAt).seconds.coerceAtLeast(0)
    }

    private fun generateVerificationCode(): String =
        random.nextInt(VERIFICATION_CODE_BOUND).toString().padStart(6, '0')
}
