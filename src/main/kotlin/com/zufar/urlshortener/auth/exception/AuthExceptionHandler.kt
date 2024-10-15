package com.zufar.urlshortener.auth.exception

import com.zufar.urlshortener.common.exception.ErrorResponse
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import javax.naming.AuthenticationException

@ControllerAdvice
class AuthExceptionHandler {

    private val log = LoggerFactory.getLogger(AuthExceptionHandler::class.java)

    @ExceptionHandler(InvalidTokenException::class)
    fun handleInvalidTokenException(ex: InvalidTokenException): ResponseEntity<ErrorResponse> {
        log.error("Invalid token: ${ex.message}", ex)
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "Invalid token")
        return ResponseEntity(errorResponse, HttpStatus.UNAUTHORIZED)
    }

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException::class)
    fun handleBadCredentialsException(ex: BadCredentialsException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(errorMessage = "Invalid email or password")
        return ResponseEntity(errorResponse, HttpStatus.UNAUTHORIZED)
    }

    @ExceptionHandler(AuthenticationException::class)
    fun handleAuthenticationException(ex: AuthenticationException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(errorMessage = "Authentication failed")
        return ResponseEntity(errorResponse, HttpStatus.UNAUTHORIZED)
    }

    @ExceptionHandler(EmailAlreadyExistsException::class)
    fun handleEmailAlreadyExistsException(ex: EmailAlreadyExistsException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "Email already in use")
        return ResponseEntity(errorResponse, HttpStatus.CONFLICT)
    }
}