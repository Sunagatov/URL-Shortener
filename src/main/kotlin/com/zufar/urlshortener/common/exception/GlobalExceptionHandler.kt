package com.zufar.urlshortener.common.exception

import com.fasterxml.jackson.databind.exc.MismatchedInputException
import com.zufar.urlshortener.auth.exception.EmailAlreadyExistsException
import com.zufar.urlshortener.auth.exception.InvalidTokenException
import com.zufar.urlshortener.shorten.exception.UrlNotFoundException
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
        log.error("Invalid request: ${ex.message}", ex)
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "Invalid request")
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(ex: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        log.error(LOG_ERROR_MESSAGE, ex)
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "Invalid input")
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(UrlNotFoundException::class)
    fun handleUrlNotFound(ex: UrlNotFoundException): ResponseEntity<ErrorResponse> {
        log.error(LOG_ERROR_MESSAGE, ex)
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "URL not found")
        return ResponseEntity(errorResponse, HttpStatus.NOT_FOUND)
    }

    @ExceptionHandler(InvalidTokenException::class)
    fun handleInvalidTokenException(ex: InvalidTokenException): ResponseEntity<ErrorResponse> {
        log.error("Invalid token: ${ex.message}", ex)
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "Invalid token")
        return ResponseEntity(errorResponse, HttpStatus.UNAUTHORIZED)
    }

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentialsException(ex: BadCredentialsException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(errorMessage = "Invalid email or password")
        return ResponseEntity(errorResponse, HttpStatus.UNAUTHORIZED)
    }

    @ExceptionHandler(AuthenticationException::class)
    fun handleAuthenticationException(ex: AuthenticationException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(errorMessage = "Authentication failed")
        return ResponseEntity(errorResponse, HttpStatus.UNAUTHORIZED)
    }

    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDeniedException(ex: AccessDeniedException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "Access denied")
        return ResponseEntity(errorResponse, HttpStatus.FORBIDDEN)
    }

    @ExceptionHandler(EmailAlreadyExistsException::class)
    fun handleEmailAlreadyExistsException(ex: EmailAlreadyExistsException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "Email already in use")
        return ResponseEntity(errorResponse, HttpStatus.CONFLICT)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValidException(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val message = ex.bindingResult.allErrors.firstOrNull()?.let { error ->
            when (error) {
                is FieldError -> error.defaultMessage ?: "${error.field} is invalid"
                else -> error.defaultMessage ?: "Request validation failed"
            }
        } ?: "Request validation failed"

        val errorResponse = ErrorResponse(errorMessage = message)
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleHttpMessageNotReadableException(ex: HttpMessageNotReadableException): ResponseEntity<ErrorResponse> {
        val message = when (ex.mostSpecificCause) {
            is MismatchedInputException -> "Required request field is missing"
            else -> "Malformed JSON request"
        }

        val errorResponse = ErrorResponse(errorMessage = message)
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(Exception::class)
    fun handleException(ex: Exception): ResponseEntity<ErrorResponse> {
        log.error(LOG_ERROR_MESSAGE, ex)
        val errorResponse = ErrorResponse(errorMessage = "An unexpected error occurred")
        return ResponseEntity(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
