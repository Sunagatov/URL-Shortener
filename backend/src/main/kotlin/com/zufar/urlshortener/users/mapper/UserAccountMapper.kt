package com.zufar.urlshortener.users.mapper

import com.zufar.urlshortener.users.api.UserAccountRecord
import com.zufar.urlshortener.users.entity.UserAccountDocument

fun UserAccountDocument.toRecord(): UserAccountRecord =
    UserAccountRecord(
        id = id,
        firstName = firstName,
        lastName = lastName,
        password = password,
        country = country,
        age = age,
        email = email,
        emailVerified = emailVerified,
        emailVerifiedAt = emailVerifiedAt,
        emailVerificationCodeHash = emailVerificationCodeHash,
        emailVerificationCodeExpiresAt = emailVerificationCodeExpiresAt,
        emailVerificationCodeSentAt = emailVerificationCodeSentAt,
        tokenVersion = tokenVersion,
        createdAt = createdAt,
        updatedAt = updatedAt
    )

fun UserAccountRecord.toDocument(): UserAccountDocument =
    UserAccountDocument(
        id = id,
        firstName = firstName,
        lastName = lastName,
        password = password,
        country = country,
        age = age,
        email = email,
        emailVerified = emailVerified,
        emailVerifiedAt = emailVerifiedAt,
        emailVerificationCodeHash = emailVerificationCodeHash,
        emailVerificationCodeExpiresAt = emailVerificationCodeExpiresAt,
        emailVerificationCodeSentAt = emailVerificationCodeSentAt,
        tokenVersion = tokenVersion,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
