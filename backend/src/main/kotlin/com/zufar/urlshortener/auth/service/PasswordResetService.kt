package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.ForgotPasswordRequest
import com.zufar.urlshortener.auth.dto.ResetPasswordRequest
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.logging.LogSanitizer
import com.zufar.urlshortener.shared.security.PrivacyHasher
import com.zufar.urlshortener.users.entity.AuthProvider
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.time.Clock
import java.time.Instant
import java.util.Base64
import com.zufar.urlshortener.shared.security.PasswordPolicy

private const val TOKEN_BYTES = 32
private const val TOKEN_ID_LENGTH = 16
private const val TOKEN_LIFETIME_MINUTES = 15L
private const val INVALID_TOKEN_CODE = "INVALID_RESET_TOKEN"

@Service
class PasswordResetService(
    private val userAccountRepository: UserAccountRepository,
    private val passwordEncoder: PasswordEncoder,
    private val clock: Clock,
    private val passwordResetNotifier: PasswordResetNotifier
) {
    private val log = LoggerFactory.getLogger(PasswordResetService::class.java)
    private val secureRandom = SecureRandom()

    fun requestReset(request: ForgotPasswordRequest) {
        val email = EmailNormalizer.normalize(request.email)
        val user = userAccountRepository.findByEmailIgnoreCase(email)

        if (user == null) {
            log.info("password_reset_requested_unknown_email emailDomain={}", LogSanitizer.emailDomain(email))
            return
        }
        val now = Instant.now(clock)
        val activeWindow = user.passwordResetWindowExpiresAt?.isAfter(now) == true
        if (user.passwordResetSentAt?.plusSeconds(60)?.isAfter(now) == true ||
            (activeWindow && user.passwordResetMessages >= 5)) return
        val token = generateToken()
        val tokenId = resetTokenId(token)
        val tokenHash = passwordEncoder.encode(token)

        val saved = userAccountRepository.updateAccount(user,
            user.copy(
                passwordResetTokenHash = tokenHash,
                passwordResetTokenId = tokenId,
                passwordResetTokenExpiresAt = now.plusSeconds(TOKEN_LIFETIME_MINUTES * 60),
                passwordResetSentAt = now,
                passwordResetMessages = if (activeWindow) user.passwordResetMessages + 1 else 1,
                passwordResetWindowExpiresAt = if (activeWindow) user.passwordResetWindowExpiresAt else now.plusSeconds(3600),
                updatedAt = now
            )
        )

        if (saved != null) passwordResetNotifier.sendResetLink(email, token, TOKEN_LIFETIME_MINUTES)
        log.info("password_reset_requested emailDomain={}", LogSanitizer.emailDomain(email))
    }

    fun resetPassword(request: ResetPasswordRequest) {
        val tokenId = resetTokenId(request.token)
        val now = Instant.now(clock)

        val user = userAccountRepository.findByPasswordResetTokenId(tokenId)
            ?.takeIf { it.passwordResetTokenExpiresAt?.isAfter(now) == true }
            ?.takeIf { passwordEncoder.matches(request.token, it.passwordResetTokenHash) }
            ?: throw ApplicationException.badRequest(INVALID_TOKEN_CODE, "Invalid or expired reset token")

        PasswordPolicy.requireAcceptable(request.newPassword, user.email)

        val saved = userAccountRepository.updateAccount(user,
            user.copy(
                password = passwordEncoder.encode(request.newPassword),
                passwordEmailVerified = true,
                authProvider = AuthProvider.LOCAL,
                emailVerified = true,
                emailVerifiedAt = user.emailVerifiedAt ?: now,
                passwordResetTokenHash = null,
                passwordResetTokenId = null,
                passwordResetTokenExpiresAt = null,
                tokenVersion = user.tokenVersion + 1,
                signInAttempts = 0,
                signInWindowExpiresAt = null,
                updatedAt = now
            )
        )

        if (saved == null) throw ApplicationException.badRequest(INVALID_TOKEN_CODE, "Invalid or expired reset token")
        log.info("password_reset_completed userId={}", user.id)
    }

    private fun generateToken(): String {
        val bytes = ByteArray(TOKEN_BYTES)
        secureRandom.nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }

    private fun resetTokenId(token: String): String =
        requireNotNull(PrivacyHasher.sha256(token)) { "Password reset token must not be blank" }
            .take(TOKEN_ID_LENGTH)
}
