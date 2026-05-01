package com.zufar.urlshortener.auth.validation

import com.zufar.urlshortener.auth.api.PasswordPolicyValidator
import com.zufar.urlshortener.auth.dto.PASSWORD_IS_TOO_LONG
import com.zufar.urlshortener.auth.dto.PASSWORD_MUST_BE_AT_LEAST_15_CHARACTERS_LONG
import com.zufar.urlshortener.auth.dto.PASSWORD_MUST_NOT_BE_EMPTY
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import org.springframework.stereotype.Service

private const val MIN_PASSWORD_LENGTH = 15
private const val MAX_PASSWORD_LENGTH = 64

@Service
class PasswordOfUserValidator : PasswordPolicyValidator {

    override fun validate(password: String) {
        when {
            password.isBlank() -> throw InvalidRequestException(PASSWORD_MUST_NOT_BE_EMPTY)
            password.length < MIN_PASSWORD_LENGTH -> throw InvalidRequestException(PASSWORD_MUST_BE_AT_LEAST_15_CHARACTERS_LONG)
            password.length > MAX_PASSWORD_LENGTH -> throw InvalidRequestException(PASSWORD_IS_TOO_LONG)
        }
    }
}
