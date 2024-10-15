package com.zufar.urlshortener.auth.service.validator

import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.common.exception.InvalidRequestException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import com.zufar.urlshortener.auth.dto.*

private const val MAX_COUNTRY_NAME_LENGTH = 50
private const val MIN_JWT_TOKEN_LENGTH = 20
private const val MAX_JWT_TOKEN_LENGTH = 500
private const val MIN_AGE = 13
private const val MAX_AGE = 120

@Service
class AuthRequestValidator(
    val emailOfUserValidator: EmailOfUserValidator,
    val passwordOfUserValidator: PasswordOfUserValidator
) {

    private val log = LoggerFactory.getLogger(AuthRequestValidator::class.java)

    fun validateAuthRequest(signInRequest: SignInRequest) {
        log.debug("Validating AuthRequest: {}", signInRequest)
        if (signInRequest.email.isBlank()) {
            throw InvalidRequestException(EMAIL_MUST_NOT_BE_EMPTY)
        }
        if (signInRequest.password.isBlank()) {
            throw InvalidRequestException(PASSWORD_MUST_NOT_BE_EMPTY)
        }
    }

    fun validateSignUpRequest(signUpRequest: SignUpRequest) {
        log.debug("Validating SignUpRequest: {}", signUpRequest)
        validateFirstName(signUpRequest.firstName)
        validateLastName(signUpRequest.lastName)
        validateCountry(signUpRequest.country)
        validateAge(signUpRequest.age)
        emailOfUserValidator.validate(signUpRequest.email)
        passwordOfUserValidator.validate(signUpRequest.password)
    }

    fun validateRefreshTokenRequest(refreshTokenRequest: RefreshTokenRequest) {
        log.debug("Validating RefreshTokenRequest: {}", refreshTokenRequest)
        val token = refreshTokenRequest.refreshToken
        if (token.isBlank()) {
            throw InvalidRequestException("Refresh token must not be empty")
        }
        if (token.length < MIN_JWT_TOKEN_LENGTH || token.length > MAX_JWT_TOKEN_LENGTH) {
            throw InvalidRequestException("Refresh token length is invalid")
        }
    }

    private fun validateFirstName(firstName: String) {
        if (firstName.isBlank()) {
            throw InvalidRequestException(FIRST_NAME_MUST_NOT_BE_EMPTY)
        }
        if (firstName.length > MAX_COUNTRY_NAME_LENGTH) {
            throw InvalidRequestException(FIRST_NAME_IS_TOO_LONG)
        }
        val nameRegex = Regex("^[a-zA-Z'-]+$")
        if (!firstName.matches(nameRegex)) {
            throw InvalidRequestException(FIRST_NAME_CONTAINS_INVALID_CHARACTERS)
        }
    }

    private fun validateLastName(lastName: String) {
        if (lastName.isBlank()) {
            throw InvalidRequestException(LAST_NAME_MUST_NOT_BE_EMPTY)
        }
        if (lastName.length > MAX_COUNTRY_NAME_LENGTH) {
            throw InvalidRequestException(LAST_NAME_IS_TOO_LONG)
        }
        val nameRegex = Regex("^[a-zA-Z'-]+$")
        if (!lastName.matches(nameRegex)) {
            throw InvalidRequestException(LAST_NAME_CONTAINS_INVALID_CHARACTERS)
        }
    }

    private fun validateCountry(country: String) {
        if (country.isBlank()) {
            throw InvalidRequestException(COUNTRY_MUST_NOT_BE_EMPTY)
        }
        if (country.length > MAX_COUNTRY_NAME_LENGTH) {
            throw InvalidRequestException(COUNTRY_NAME_IS_TOO_LONG)
        }
        val nameRegex = Regex("^[a-zA-Z'-]+$")
        if (!country.matches(nameRegex)) {
            throw InvalidRequestException(COUNTRY_NAME_CONTAINS_INVALID_CHARACTERS)
        }
    }

    private fun validateAge(age: Int) {
        if (age < MIN_AGE || age > MAX_AGE) {
            throw InvalidRequestException(AGE_MUST_BE_BETWEEN_13_AND_120)
        }
    }
}
