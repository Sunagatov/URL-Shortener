package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.springframework.stereotype.Service
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus

@Service
class ExpirationReminderPolicy(
    private val users: UserAccountRepository,
    @Value("\${app.urls.expiration-reminders.enabled:false}") private val enabled: Boolean
) {
    fun requireVerifiedOwner(userId: String?) {
        if (!enabled) throw ApplicationException(HttpStatus.SERVICE_UNAVAILABLE,
            "EXPIRATION_REMINDERS_UNAVAILABLE", "Email reminders are temporarily unavailable.", 60)
        if (recipient(userId) == null) {
            throw ApplicationException.badRequest("REMINDER_REQUIRES_VERIFIED_ACCOUNT",
                "Verify your email or sign in with Google before requesting an email reminder.")
        }
    }

    fun recipient(userId: String?): UserAccountDocument? =
        userId?.let { users.findById(it).orElse(null) }
            ?.takeIf { it.emailVerified && (it.passwordEmailVerified || it.googleSubject != null) }
}
