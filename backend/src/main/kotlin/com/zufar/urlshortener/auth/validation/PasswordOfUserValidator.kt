package com.zufar.urlshortener.auth.validation

import com.zufar.urlshortener.shared.exception.InvalidRequestException
import org.springframework.stereotype.Service

private const val MIN_PASSWORD_LENGTH = 15
private const val MAX_PASSWORD_LENGTH = 64

const val PASSWORD_MUST_NOT_BE_EMPTY = "Password must not be empty"

@Service
class PasswordOfUserValidator {

    fun validate(password: String) {
        when {
            password.isBlank() -> throw InvalidRequestException(PASSWORD_MUST_NOT_BE_EMPTY)
            password.length < MIN_PASSWORD_LENGTH -> throw InvalidRequestException("Password must be at least $MIN_PASSWORD_LENGTH characters long")
            password.length > MAX_PASSWORD_LENGTH -> throw InvalidRequestException("Password must be at most $MAX_PASSWORD_LENGTH characters long")
        }
    }
}
