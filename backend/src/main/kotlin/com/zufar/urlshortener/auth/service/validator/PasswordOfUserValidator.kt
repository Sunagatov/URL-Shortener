package com.zufar.urlshortener.auth.service.validator

import com.zufar.urlshortener.shared.exception.InvalidRequestException
import org.springframework.stereotype.Service
import com.zufar.urlshortener.auth.dto.*

private const val MIN_PASSWORD_LENGTH = 8
private const val MAX_PASSWORD_LENGTH = 50
private val UPPERCASE_REGEX = Regex("[A-Z]")
private val LOWERCASE_REGEX = Regex("[a-z]")
private val DIGIT_REGEX = Regex("[0-9]")

@Service
class PasswordOfUserValidator {

    fun validate(password: String) {
        if (password.isBlank()) throw InvalidRequestException(PASSWORD_MUST_NOT_BE_EMPTY)
        if (password.contains(" ")) throw InvalidRequestException(PASSWORD_MUST_NOT_CONTAIN_SPACES)
        if (password.length < MIN_PASSWORD_LENGTH) throw InvalidRequestException(PASSWORD_MUST_BE_AT_LEAST_8_CHARACTERS_LONG)
        if (password.length > MAX_PASSWORD_LENGTH) throw InvalidRequestException(PASSWORD_IS_TOO_LONG)
        if (!password.contains(UPPERCASE_REGEX)) throw InvalidRequestException(PASSWORD_MUST_CONTAIN_AT_LEAST_ONE_UPPERCASE_LETTER)
        if (!password.contains(LOWERCASE_REGEX)) throw InvalidRequestException(PASSWORD_MUST_CONTAIN_AT_LEAST_ONE_LOWERCASE_LETTER)
        if (!password.contains(DIGIT_REGEX)) throw InvalidRequestException(PASSWORD_MUST_CONTAIN_AT_LEAST_ONE_DIGIT)
    }
}
