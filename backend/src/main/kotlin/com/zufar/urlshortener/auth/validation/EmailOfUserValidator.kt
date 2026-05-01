package com.zufar.urlshortener.auth.validation

import com.zufar.urlshortener.auth.dto.EMAIL_FORMAT_IS_INVALID
import com.zufar.urlshortener.auth.dto.EMAIL_IS_TOO_LONG
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import org.apache.commons.validator.routines.EmailValidator
import org.springframework.stereotype.Service

private const val MAX_EMAIL_LENGTH = 254

const val EMAIL_MUST_NOT_BE_EMPTY = "Email must not be empty"

@Service
class EmailOfUserValidator {

    private val emailValidator = EmailValidator.getInstance()

    fun validate(email: String) {
        when {
            email.isBlank() -> throw InvalidRequestException(EMAIL_MUST_NOT_BE_EMPTY)
            email.length > MAX_EMAIL_LENGTH -> throw InvalidRequestException(EMAIL_IS_TOO_LONG)
            !emailValidator.isValid(email) -> throw InvalidRequestException(EMAIL_FORMAT_IS_INVALID)
        }
    }
}
