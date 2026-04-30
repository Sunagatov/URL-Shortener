package com.zufar.urlshortener.shared.exception

import com.zufar.urlshortener.auth.exception.EmailAlreadyExistsException
import com.zufar.urlshortener.auth.exception.InvalidTokenException
import com.zufar.urlshortener.auth.exception.UserNotFoundException
import com.zufar.urlshortener.urls.exception.UrlNotFoundException
import org.slf4j.LoggerFactory
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

private const val LOG_ERROR_MESSAGE = "An unexpected error occurred"

@Suppress("unused")
@ControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(InvalidRequestException::class)
    fun handleInvalidRequestException(ex: InvalidRequestException): ResponseEntity<ErrorResponse> {
        log.warn("Invalid request: {}", ex.message)
        return errorResponse(HttpStatus.BAD_REQUEST, ex.message ?: "Invalid request")
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(ex: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        log.warn("Invalid input: {}", ex.message)
        return errorResponse(HttpStatus.BAD_REQUEST, ex.message ?: "Invalid input")
    }

    @ExceptionHandler(UrlNotFoundException::class)
    fun handleUrlNotFound(ex: UrlNotFoundException): ResponseEntity<ErrorResponse> {
        log.warn("URL not found: {}", ex.message)
        return errorResponse(HttpStatus.NOT_FOUND, ex.message ?: "URL not found")
    }

    @ExceptionHandler(InvalidTokenException::class)
    fun handleInvalidTokenException(ex: InvalidTokenException): ResponseEntity<ErrorResponse> {
        log.warn("Invalid token: {}", ex.message)
        return errorResponse(HttpStatus.UNAUTHORIZED, ex.message ?: "Invalid token")
    }

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentialsException(ex: BadCredentialsException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.UNAUTHORIZED, "Invalid email or password")
    }

    @ExceptionHandler(AuthenticationException::class)
    fun handleAuthenticationException(ex: AuthenticationException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.UNAUTHORIZED, "Authentication failed")
    }

    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDeniedException(ex: AccessDeniedException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.FORBIDDEN, ex.message ?: "Access denied")
    }

    @ExceptionHandler(EmailAlreadyExistsException::class)
    fun handleEmailAlreadyExistsException(ex: EmailAlreadyExistsException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.CONFLICT, ex.message ?: "Email already in use")
    }

    @ExceptionHandler(UserNotFoundException::class)
    fun handleUserNotFoundException(ex: UserNotFoundException): ResponseEntity<ErrorResponse> {
        return errorResponse(HttpStatus.NOT_FOUND, ex.message ?: "User not found")
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValidException(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val message = ex.bindingResult.allErrors.firstOrNull()?.let { error ->
            when (error) {
                is FieldError -> error.defaultMessage ?: "${error.field} is invalid"
                else -> error.defaultMessage ?: "Request validation failed"
            }
        } ?: "Request validation failed"

        return errorResponse(HttpStatus.BAD_REQUEST, message)
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

        return errorResponse(HttpStatus.BAD_REQUEST, message)
    }

    @ExceptionHandler(Exception::class)
    fun handleException(ex: Exception): ResponseEntity<ErrorResponse> {
        log.error(LOG_ERROR_MESSAGE, ex)
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred")
    }

    private fun Throwable.isMissingRequiredField(): Boolean {
        val detail = message ?: return false
        return detail.contains("missing", ignoreCase = true) ||
            detail.contains("creator parameter", ignoreCase = true) ||
            detail.contains("non-null", ignoreCase = true) ||
            detail.contains("must not be null", ignoreCase = true) ||
            detail.contains("null value", ignoreCase = true) ||
            detail.contains("required creator property", ignoreCase = true)
    }

    private fun errorResponse(status: HttpStatus, message: String): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(status).body(ErrorResponse(errorMessage = message))
}
