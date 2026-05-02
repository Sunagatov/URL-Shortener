package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.ForgotPasswordRequest
import com.zufar.urlshortener.auth.dto.ResetPasswordRequest
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.logging.LogSanitizer
import com.zufar.urlshortener.users.entity.AuthProvider
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.time.Clock
import java.time.LocalDateTime
import java.util.Base64

private const val TOKEN_BYTES = 32
private const val TOKEN_ID_LENGTH = 16
private const val TOKEN_LIFETIME_MINUTES = 15L
private const val INVALID_TOKEN_CODE = "INVALID_RESET_TOKEN"

@Service
class PasswordResetService(
    private val userAccountRepository: UserAccountRepository,
    private val passwordEncoder: PasswordEncoder,
    private val clock: Clock
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
        if (user.authProvider == AuthProvider.GOOGLE && user.password == null) {
            log.info("password_reset_skipped_google_user userId={}", user.id)
            return
        }

        val token = generateToken()
        val tokenId = token.take(TOKEN_ID_LENGTH)
        val tokenHash = passwordEncoder.encode(token)
        val now = LocalDateTime.now(clock)

        userAccountRepository.save(
            user.copy(
                passwordResetTokenHash = tokenHash,
                passwordResetTokenId = tokenId,
                passwordResetTokenExpiresAt = now.plusMinutes(TOKEN_LIFETIME_MINUTES),
                updatedAt = now
            )
        )

        log.info("password_reset_token_generated userId={} emailDomain={}", user.id, LogSanitizer.emailDomain(email))
    }

    fun resetPassword(request: ResetPasswordRequest) {
        val tokenId = request.token.take(TOKEN_ID_LENGTH)
        val now = LocalDateTime.now(clock)

        val user = userAccountRepository.findByPasswordResetTokenId(tokenId)
            ?.takeIf { it.passwordResetTokenExpiresAt?.isAfter(now) == true }
            ?.takeIf { passwordEncoder.matches(request.token, it.passwordResetTokenHash) }
            ?: throw ApplicationException.badRequest(INVALID_TOKEN_CODE, "Invalid or expired reset token")

        userAccountRepository.save(
            user.copy(
                password = passwordEncoder.encode(request.newPassword),
                passwordResetTokenHash = null,
                passwordResetTokenId = null,
                passwordResetTokenExpiresAt = null,
                tokenVersion = user.tokenVersion + 1,
                updatedAt = now
            )
        )

        log.info("password_reset_completed userId={}", user.id)
    }

    private fun generateToken(): String {
        val bytes = ByteArray(TOKEN_BYTES)
        secureRandom.nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }
}
