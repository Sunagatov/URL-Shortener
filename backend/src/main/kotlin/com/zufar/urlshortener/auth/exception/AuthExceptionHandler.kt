package com.zufar.urlshortener.auth.exception

import com.zufar.urlshortener.shared.web.ErrorResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

private const val INVALID_TOKEN_CODE = "INVALID_TOKEN"
private const val EMAIL_ALREADY_EXISTS_CODE = "EMAIL_ALREADY_EXISTS"
private const val EMAIL_NOT_VERIFIED_CODE = "EMAIL_NOT_VERIFIED"
private const val USER_NOT_FOUND_CODE = "USER_NOT_FOUND"
private const val INVALID_VERIFICATION_CODE = "INVALID_VERIFICATION_CODE"
private const val VERIFICATION_RESEND_TOO_SOON_CODE = "VERIFICATION_RESEND_TOO_SOON"

@RestControllerAdvice(basePackages = ["com.zufar.urlshortener.auth"])
@Suppress("unused")
class AuthExceptionHandler {

    @ExceptionHandler(InvalidTokenException::class)
    fun handleInvalidTokenException(
        ex: InvalidTokenException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> =
        errorResponse(request, HttpStatus.UNAUTHORIZED, ex.message ?: "Invalid token", INVALID_TOKEN_CODE)

    @ExceptionHandler(EmailAlreadyExistsException::class)
    fun handleEmailAlreadyExistsException(
        ex: EmailAlreadyExistsException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> =
        errorResponse(request, HttpStatus.CONFLICT, ex.message ?: "Email already in use", EMAIL_ALREADY_EXISTS_CODE)

    @ExceptionHandler(EmailNotVerifiedException::class)
    fun handleEmailNotVerifiedException(
        ex: EmailNotVerifiedException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> =
        errorResponse(request, HttpStatus.FORBIDDEN, ex.message ?: "Email is not verified", EMAIL_NOT_VERIFIED_CODE)

    @ExceptionHandler(UserNotFoundException::class)
    fun handleUserNotFoundException(
        ex: UserNotFoundException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> =
        errorResponse(request, HttpStatus.NOT_FOUND, ex.message ?: "User not found", USER_NOT_FOUND_CODE)

    @ExceptionHandler(InvalidVerificationCodeException::class)
    fun handleInvalidVerificationCodeException(
        ex: InvalidVerificationCodeException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> =
        errorResponse(request, HttpStatus.BAD_REQUEST, ex.message ?: "Invalid verification code", INVALID_VERIFICATION_CODE)

    @ExceptionHandler(VerificationResendTooSoonException::class)
    fun handleVerificationResendTooSoonException(
        ex: VerificationResendTooSoonException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> =
        errorResponse(
            request,
            HttpStatus.TOO_MANY_REQUESTS,
            ex.message ?: "Verification code was sent recently",
            VERIFICATION_RESEND_TOO_SOON_CODE,
            ex.retryAfterSeconds
        )

    private fun errorResponse(
        request: HttpServletRequest,
        status: HttpStatus,
        message: String,
        code: String,
        retryAfterSeconds: Long? = null
    ): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(status).body(
            ErrorResponse.of(request, status, message, code, retryAfterSeconds)
        )
}
