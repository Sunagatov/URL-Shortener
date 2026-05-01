package com.zufar.urlshortener.shared.exception

import com.zufar.urlshortener.auth.exception.EmailAlreadyExistsException
import com.zufar.urlshortener.auth.exception.EmailNotVerifiedException
import com.zufar.urlshortener.auth.exception.InvalidTokenException
import com.zufar.urlshortener.auth.exception.InvalidVerificationCodeException
import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.auth.exception.VerificationResendTooSoonException
import com.zufar.urlshortener.urls.exception.UrlNotFoundException
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.AuthenticationException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes

private const val INVALID_REQUEST_CODE = "INVALID_REQUEST"
private const val INVALID_INPUT_CODE = "INVALID_INPUT"
private const val URL_NOT_FOUND_CODE = "URL_NOT_FOUND"
private const val INVALID_TOKEN_CODE = "INVALID_TOKEN"
private const val INVALID_CREDENTIALS_CODE = "INVALID_CREDENTIALS"
private const val AUTHENTICATION_FAILED_CODE = "AUTHENTICATION_FAILED"
private const val ACCESS_DENIED_CODE = "ACCESS_DENIED"
private const val EMAIL_ALREADY_EXISTS_CODE = "EMAIL_ALREADY_EXISTS"
private const val EMAIL_NOT_VERIFIED_CODE = "EMAIL_NOT_VERIFIED"
private const val USER_NOT_FOUND_CODE = "USER_NOT_FOUND"
private const val INVALID_VERIFICATION_CODE = "INVALID_VERIFICATION_CODE"
private const val VERIFICATION_RESEND_TOO_SOON_CODE = "VERIFICATION_RESEND_TOO_SOON"
private const val REQUEST_VALIDATION_FAILED_CODE = "REQUEST_VALIDATION_FAILED"
private const val MALFORMED_JSON_CODE = "MALFORMED_JSON"
private const val INTERNAL_SERVER_ERROR_CODE = "INTERNAL_SERVER_ERROR"

@Suppress("unused")
@ControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(InvalidRequestException::class)
    fun handleInvalidRequestException(ex: InvalidRequestException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.message ?: "Invalid request", INVALID_REQUEST_CODE)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(ex: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.message ?: "Invalid input", INVALID_INPUT_CODE)
    }

    @ExceptionHandler(UrlNotFoundException::class)
    fun handleUrlNotFound(ex: UrlNotFoundException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.NOT_FOUND, ex.message ?: "URL not found", URL_NOT_FOUND_CODE)
    }

    @ExceptionHandler(InvalidTokenException::class)
    fun handleInvalidTokenException(ex: InvalidTokenException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.UNAUTHORIZED, ex.message ?: "Invalid token", INVALID_TOKEN_CODE)
    }

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentialsException(ex: BadCredentialsException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.UNAUTHORIZED, "Invalid email or password", INVALID_CREDENTIALS_CODE)
    }

    @ExceptionHandler(AuthenticationException::class)
    fun handleAuthenticationException(ex: AuthenticationException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.UNAUTHORIZED, "Authentication failed", AUTHENTICATION_FAILED_CODE)
    }

    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDeniedException(ex: AccessDeniedException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.FORBIDDEN, ex.message ?: "Access denied", ACCESS_DENIED_CODE)
    }

    @ExceptionHandler(EmailAlreadyExistsException::class)
    fun handleEmailAlreadyExistsException(ex: EmailAlreadyExistsException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.CONFLICT, ex.message ?: "Email already in use", EMAIL_ALREADY_EXISTS_CODE)
    }

    @ExceptionHandler(EmailNotVerifiedException::class)
    fun handleEmailNotVerifiedException(ex: EmailNotVerifiedException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.FORBIDDEN, ex.message ?: "Email is not verified", EMAIL_NOT_VERIFIED_CODE)
    }

    @ExceptionHandler(UserNotFoundException::class)
    fun handleUserNotFoundException(ex: UserNotFoundException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.NOT_FOUND, ex.message ?: "User not found", USER_NOT_FOUND_CODE)
    }

    @ExceptionHandler(InvalidVerificationCodeException::class)
    fun handleInvalidVerificationCodeException(ex: InvalidVerificationCodeException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.message ?: "Invalid verification code", INVALID_VERIFICATION_CODE)
    }

    @ExceptionHandler(VerificationResendTooSoonException::class)
    fun handleVerificationResendTooSoonException(ex: VerificationResendTooSoonException): ResponseEntity<ErrorResponse> {
        return errorResponse(
            HttpStatus.TOO_MANY_REQUESTS,
            ex.message ?: "Verification code was sent recently",
            VERIFICATION_RESEND_TOO_SOON_CODE,
            ex.retryAfterSeconds
        )
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValidException(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val message = ex.bindingResult.allErrors.firstOrNull()?.let { error ->
            when (error) {
                is FieldError -> error.defaultMessage ?: "${error.field} is invalid"
                else -> error.defaultMessage ?: "Request validation failed"
            }
        } ?: "Request validation failed"

        return errorResponse(HttpStatus.BAD_REQUEST, message, REQUEST_VALIDATION_FAILED_CODE)
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleHttpMessageNotReadableException(ex: HttpMessageNotReadableException): ResponseEntity<ErrorResponse> {
        val cause = ex.mostSpecificCause
        val exceptionClassName = cause::class.java.name
        val message = when {
            cause.isMissingRequiredField() -> "Required request field is missing"
            exceptionClassName.endsWith(".InvalidFormatException") -> "Request field has an invalid value or type"
            exceptionClassName.endsWith(".MismatchedInputException") ||
                exceptionClassName.endsWith(".MissingKotlinParameterException") ->
                "Request field has an invalid value or type"
            else -> "Malformed JSON request"
        }

        return errorResponse(HttpStatus.BAD_REQUEST, message, MALFORMED_JSON_CODE)
    }

    @ExceptionHandler(Exception::class)
    fun handleException(ex: Exception): ResponseEntity<ErrorResponse> {
        logger.error(
            "request_failed method={} path={} status={} errorCode={}",
            currentMethod(),
            currentPath(),
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            INTERNAL_SERVER_ERROR_CODE,
            ex
        )
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", INTERNAL_SERVER_ERROR_CODE)
    }

    private fun currentMethod(): String =
        currentRequestAttributes()?.request?.method ?: HttpMethod.GET.name()

    private fun currentPath(): String =
        currentRequestAttributes()?.request?.requestURI ?: "-"

    private fun currentRequestAttributes(): ServletRequestAttributes? =
        RequestContextHolder.getRequestAttributes() as? ServletRequestAttributes

    private fun Throwable.isMissingRequiredField(): Boolean {
        val detail = message ?: return false
        return detail.contains("missing", ignoreCase = true) ||
            detail.contains("creator parameter", ignoreCase = true) ||
            detail.contains("non-null", ignoreCase = true) ||
            detail.contains("must not be null", ignoreCase = true) ||
            detail.contains("null value", ignoreCase = true) ||
            detail.contains("required creator property", ignoreCase = true)
    }

    private fun errorResponse(
        status: HttpStatus,
        message: String,
        code: String,
        retryAfterSeconds: Long? = null
    ): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(status).body(
            ErrorResponse.of(currentRequestAttributes()?.request, status, message, code, retryAfterSeconds)
        )
}

private val logger = org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler::class.java)
