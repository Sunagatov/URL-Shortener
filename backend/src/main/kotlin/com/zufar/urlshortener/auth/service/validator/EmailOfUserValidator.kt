package com.zufar.urlshortener.auth.service.validator

import com.zufar.urlshortener.auth.dto.*
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import org.apache.commons.validator.routines.EmailValidator
import org.springframework.stereotype.Service

private const val MAX_EMAIL_LENGTH = 254

@Service
class EmailOfUserValidator {
    private val emailValidator = EmailValidator.getInstance()

    fun validate(email: String) {
        validate(email.isBlank(), EMAIL_MUST_NOT_BE_EMPTY)
        validate(email.length > MAX_EMAIL_LENGTH, EMAIL_IS_TOO_LONG)
        validate(!emailValidator.isValid(email), EMAIL_FORMAT_IS_INVALID)
    }

    private fun validate(invalid: Boolean, message: String) {
        if (invalid) {
            throw InvalidRequestException(message)
        }
    }
}
