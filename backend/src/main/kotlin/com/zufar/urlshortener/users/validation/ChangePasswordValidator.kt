package com.zufar.urlshortener.users.validation

import com.zufar.urlshortener.auth.api.PasswordPolicyValidator
import com.zufar.urlshortener.shared.exception.InvalidRequestException
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import org.springframework.stereotype.Service

private const val CURRENT_PASSWORD_REQUIRED_MESSAGE = "Password must not be empty"

@Service
class ChangePasswordValidator(
    private val passwordPolicyValidator: PasswordPolicyValidator
) {

    fun validate(request: ChangePasswordRequest) {
        if (request.currentPassword.isBlank()) {
            throw InvalidRequestException(CURRENT_PASSWORD_REQUIRED_MESSAGE)
        }

        passwordPolicyValidator.validate(request.newPassword)
    }
}
