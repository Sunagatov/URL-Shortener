package com.zufar.urlshortener.auth.service.validator

import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.common.exception.InvalidRequestException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import com.zufar.urlshortener.auth.dto.*

private const val MAX_NAME_LENGTH = 50
private const val MIN_JWT_TOKEN_LENGTH = 20
private const val MAX_JWT_TOKEN_LENGTH = 500
private const val MIN_AGE = 13
private const val MAX_AGE = 120
private val SIMPLE_NAME_REGEX = Regex("^[a-zA-Z'-]+$")
private val COUNTRY_NAME_REGEX = Regex("^[a-zA-Z'\\-]+(\\s[a-zA-Z'\\-]+)*$")

@Service
class AuthRequestValidator(
    val emailOfUserValidator: EmailOfUserValidator,
    val passwordOfUserValidator: PasswordOfUserValidator
) {

    private val log = LoggerFactory.getLogger(AuthRequestValidator::class.java)

    fun validateAuthRequest(signInRequest: SignInRequest) {
        log.debug("Validating AuthRequest: {}", signInRequest)
        if (signInRequest.email.isBlank()) throw InvalidRequestException(EMAIL_MUST_NOT_BE_EMPTY)
        if (signInRequest.password.isBlank()) throw InvalidRequestException(PASSWORD_MUST_NOT_BE_EMPTY)
    }

    fun validateSignUpRequest(signUpRequest: SignUpRequest) {
        log.debug("Validating SignUpRequest: {}", signUpRequest)
        validateName(signUpRequest.firstName, FIRST_NAME_MUST_NOT_BE_EMPTY, FIRST_NAME_IS_TOO_LONG, FIRST_NAME_CONTAINS_INVALID_CHARACTERS)
        validateName(signUpRequest.lastName, LAST_NAME_MUST_NOT_BE_EMPTY, LAST_NAME_IS_TOO_LONG, LAST_NAME_CONTAINS_INVALID_CHARACTERS)
        validateCountry(signUpRequest.country)
        validateAge(signUpRequest.age)
        emailOfUserValidator.validate(signUpRequest.email)
        passwordOfUserValidator.validate(signUpRequest.password)
    }

    fun validateRefreshTokenRequest(refreshTokenRequest: RefreshTokenRequest) {
        log.debug("Validating RefreshTokenRequest: {}", refreshTokenRequest)
        val token = refreshTokenRequest.refreshToken
        if (token.isBlank()) throw InvalidRequestException("Refresh token must not be empty")
        if (token.length < MIN_JWT_TOKEN_LENGTH || token.length > MAX_JWT_TOKEN_LENGTH) {
            throw InvalidRequestException("Refresh token length is invalid")
        }
    }

    private fun validateName(name: String, emptyMsg: String, tooLongMsg: String, invalidCharsMsg: String) {
        if (name.isBlank()) throw InvalidRequestException(emptyMsg)
        if (name.length > MAX_NAME_LENGTH) throw InvalidRequestException(tooLongMsg)
        if (!name.matches(SIMPLE_NAME_REGEX)) throw InvalidRequestException(invalidCharsMsg)
    }

    private fun validateCountry(country: String) {
        if (country.isBlank()) throw InvalidRequestException(COUNTRY_MUST_NOT_BE_EMPTY)
        if (country.length > MAX_NAME_LENGTH) throw InvalidRequestException(COUNTRY_NAME_IS_TOO_LONG)
        if (!country.matches(COUNTRY_NAME_REGEX)) throw InvalidRequestException(COUNTRY_NAME_CONTAINS_INVALID_CHARACTERS)
    }

    private fun validateAge(age: String) {
        if (age.isBlank()) throw InvalidRequestException(AGE_MUST_NOT_BE_EMPTY)
        val ageInt = age.toIntOrNull() ?: throw InvalidRequestException(AGE_MUST_BE_VALID_INT)
        if (ageInt < MIN_AGE || ageInt > MAX_AGE) throw InvalidRequestException(AGE_MUST_BE_BETWEEN_13_AND_120)
    }
}
