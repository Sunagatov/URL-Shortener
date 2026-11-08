package com.zufar.urlshortener.users.repository

import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.users.entity.UserAccountDocument
import java.time.Instant

interface UserAccountUpdates {
    fun updateAccount(expected: UserAccountDocument, updated: UserAccountDocument): UserAccountDocument?
    fun claimVerificationAttempt(id: String, challengeHash: String, now: Instant, limit: Int): UserAccountDocument?
}

fun UserAccountRepository.updateAccountOrConflict(
    expected: UserAccountDocument,
    updated: UserAccountDocument
): UserAccountDocument = updateAccount(expected, updated)
    ?: throw ApplicationException.conflict("ACCOUNT_CHANGED", "Account changed during this request. Please try again.")
