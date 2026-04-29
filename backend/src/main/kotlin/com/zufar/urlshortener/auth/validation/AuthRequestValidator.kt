package com.zufar.urlshortener.auth.validation

import com.zufar.urlshortener.auth.dto.RefreshTokenRequest
import com.zufar.urlshortener.auth.dto.SignInRequest
import com.zufar.urlshortener.auth.dto.SignUpRequest
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

private const val MAX_NAME_LENGTH = 50
private const val MIN_JWT_TOKEN_LENGTH = 20
private const val MAX_JWT_TOKEN_LENGTH = 500
private const val MIN_AGE = 13
private const val MAX_AGE = 120
private val SIMPLE_NAME_REGEX = Regex("^[a-zA-Z'-]+$")
private val COUNTRY_NAME_REGEX = Regex("^[a-zA-Z'\\-]+(\\s[a-zA-Z'\\-]+)*$")

@Service
class AuthRequestValidator(
    private val emailOfUserValidator: EmailOfUserValidator,
    private val passwordOfUserValidator: PasswordOfUserValidator
) {

    private val log = LoggerFactory.getLogger(AuthRequestValidator::class.java)

    fun validateAuthRequest(signInRequest: SignInRequest) {
        log.debug("Validating AuthRequest: {}", signInRequest)
        validate(signInRequest.email.isBlank(), EMAIL_MUST_NOT_BE_EMPTY)
        validate(signInRequest.password.isBlank(), PASSWORD_MUST_NOT_BE_EMPTY)
    }

    fun validateSignUpRequest(signUpRequest: SignUpRequest) {
        log.debug("Validating SignUpRequest: {}", signUpRequest)
        validateName(
            signUpRequest.firstName,
            FIRST_NAME_MUST_NOT_BE_EMPTY,
            FIRST_NAME_IS_TOO_LONG,
            FIRST_NAME_CONTAINS_INVALID_CHARACTERS
        )
        validateName(
            signUpRequest.lastName,
            LAST_NAME_MUST_NOT_BE_EMPTY,
            LAST_NAME_IS_TOO_LONG,
            LAST_NAME_CONTAINS_INVALID_CHARACTERS
        )
        validateCountry(signUpRequest.country)
        validateAge(signUpRequest.age)
        emailOfUserValidator.validate(signUpRequest.email)
        passwordOfUserValidator.validate(signUpRequest.password)
    }

    fun validateRefreshTokenRequest(refreshTokenRequest: RefreshTokenRequest) {
        log.debug("Validating RefreshTokenRequest: {}", refreshTokenRequest)
        val token = refreshTokenRequest.refreshToken
        validate(token.isBlank(), "Refresh token must not be empty")
        validate(token.length < MIN_JWT_TOKEN_LENGTH || token.length > MAX_JWT_TOKEN_LENGTH, "Refresh token length is invalid")
    }

    fun validateChangePasswordRequest(changePasswordRequest: ChangePasswordRequest) {
        log.debug("Validating ChangePasswordRequest")
        validate(changePasswordRequest.currentPassword.isBlank(), PASSWORD_MUST_NOT_BE_EMPTY)
        passwordOfUserValidator.validate(changePasswordRequest.newPassword)
    }

    private fun validateName(name: String, emptyMsg: String, tooLongMsg: String, invalidCharsMsg: String) {
        validate(name.isBlank(), emptyMsg)
        validate(name.length > MAX_NAME_LENGTH, tooLongMsg)
        validate(!name.matches(SIMPLE_NAME_REGEX), invalidCharsMsg)
    }

    private fun validateCountry(country: String) {
        validate(country.isBlank(), COUNTRY_MUST_NOT_BE_EMPTY)
        validate(country.length > MAX_NAME_LENGTH, COUNTRY_NAME_IS_TOO_LONG)
        validate(!country.matches(COUNTRY_NAME_REGEX), COUNTRY_NAME_CONTAINS_INVALID_CHARACTERS)
    }

    private fun validateAge(age: Int) {
        validate(age == 0, AGE_MUST_NOT_BE_EMPTY)
        validate(age < MIN_AGE || age > MAX_AGE, AGE_MUST_BE_BETWEEN_13_AND_120)
    }

    private fun validate(invalid: Boolean, message: String) {
        if (invalid) {
            throw InvalidRequestException(message)
        }
    }
}
