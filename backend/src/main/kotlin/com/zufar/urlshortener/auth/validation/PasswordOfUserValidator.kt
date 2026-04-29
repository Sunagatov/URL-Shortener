package com.zufar.urlshortener.auth.validation

import com.zufar.urlshortener.shared.exception.InvalidRequestException
import org.springframework.stereotype.Service

private const val MIN_PASSWORD_LENGTH = 8
private const val MAX_PASSWORD_LENGTH = 100
private val UPPERCASE_REGEX = Regex(".*[A-Z].*")
private val LOWERCASE_REGEX = Regex(".*[a-z].*")
private val DIGIT_REGEX = Regex(".*\\d.*")
private val SPECIAL_CHAR_REGEX = Regex(".*[^A-Za-z0-9].*")

const val PASSWORD_MUST_NOT_BE_EMPTY = "Password must not be empty"

@Service
class PasswordOfUserValidator {

    fun validate(password: String) {
        when {
            password.isBlank() -> throw InvalidRequestException(PASSWORD_MUST_NOT_BE_EMPTY)
            password.length < MIN_PASSWORD_LENGTH -> throw InvalidRequestException("Password must be at least $MIN_PASSWORD_LENGTH characters long")
            password.length > MAX_PASSWORD_LENGTH -> throw InvalidRequestException("Password must be at most $MAX_PASSWORD_LENGTH characters long")
            !password.matches(UPPERCASE_REGEX) -> throw InvalidRequestException("Password must contain at least one uppercase letter")
            !password.matches(LOWERCASE_REGEX) -> throw InvalidRequestException("Password must contain at least one lowercase letter")
            !password.matches(DIGIT_REGEX) -> throw InvalidRequestException("Password must contain at least one digit")
            !password.matches(SPECIAL_CHAR_REGEX) -> throw InvalidRequestException("Password must contain at least one special character")
        }
    }
}
