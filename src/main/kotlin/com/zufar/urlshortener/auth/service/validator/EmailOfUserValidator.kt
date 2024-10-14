package com.zufar.urlshortener.auth.service.validator

import com.zufar.urlshortener.auth.dto.*
import com.zufar.urlshortener.exception.InvalidRequestException
import org.apache.commons.validator.routines.EmailValidator
import org.springframework.stereotype.Service

private const val MAX_EMAIL_LENGTH = 254

@Service
class EmailOfUserValidator {

    fun validate(email: String) {
        if (email.isBlank()) {
            throw InvalidRequestException(EMAIL_MUST_NOT_BE_EMPTY)
        }

        if (email.length > MAX_EMAIL_LENGTH) {
            throw InvalidRequestException(EMAIL_IS_TOO_LONG)
        }

        if (!EmailValidator.getInstance().isValid(email)) {
            throw InvalidRequestException(EMAIL_FORMAT_IS_INVALID)
        }
    }
}
