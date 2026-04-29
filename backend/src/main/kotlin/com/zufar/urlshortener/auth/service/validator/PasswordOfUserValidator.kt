package com.zufar.urlshortener.auth.service.validator

import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.auth.dto.*
import org.springframework.stereotype.Service

private const val MIN_PASSWORD_LENGTH = 8
private const val MAX_PASSWORD_LENGTH = 50
private val UPPERCASE_REGEX = Regex("[A-Z]")
private val LOWERCASE_REGEX = Regex("[a-z]")
private val DIGIT_REGEX = Regex("[0-9]")

@Service
class PasswordOfUserValidator {

    fun validate(password: String) {
        validate(password.isBlank(), PASSWORD_MUST_NOT_BE_EMPTY)
        validate(password.contains(" "), PASSWORD_MUST_NOT_CONTAIN_SPACES)
        validate(password.length < MIN_PASSWORD_LENGTH, PASSWORD_MUST_BE_AT_LEAST_8_CHARACTERS_LONG)
        validate(password.length > MAX_PASSWORD_LENGTH, PASSWORD_IS_TOO_LONG)
        validate(!password.contains(UPPERCASE_REGEX), PASSWORD_MUST_CONTAIN_AT_LEAST_ONE_UPPERCASE_LETTER)
        validate(!password.contains(LOWERCASE_REGEX), PASSWORD_MUST_CONTAIN_AT_LEAST_ONE_LOWERCASE_LETTER)
        validate(!password.contains(DIGIT_REGEX), PASSWORD_MUST_CONTAIN_AT_LEAST_ONE_DIGIT)
    }

    private fun validate(invalid: Boolean, message: String) {
        if (invalid) {
            throw InvalidRequestException(message)
        }
    }
}
