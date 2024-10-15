package com.zufar.urlshortener.common.exception

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler

private const val LOG_ERROR_MESSAGE = "An unexpected error occurred"

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

    @ExceptionHandler(Exception::class)
    fun handleException(ex: Exception): ResponseEntity<ErrorResponse> {
        log.error(LOG_ERROR_MESSAGE, ex)
        val errorMessage = "An unexpected error occurred: ${ex.message ?: "No additional details provided"}"
        val errorResponse = ErrorResponse(errorMessage = errorMessage)
        return ResponseEntity(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR)
    }
}