package com.zufar.urlshortener.shorten.exception

import com.zufar.urlshortener.common.exception.ErrorResponse
import com.zufar.urlshortener.common.exception.GlobalExceptionHandler
import com.zufar.urlshortener.common.exception.InvalidRequestException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler

private const val LOG_ERROR_MESSAGE = "An unexpected error occurred"

@ControllerAdvice
class ShortenUrlExceptionHandler {

    private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(InvalidRequestException::class)
    fun handleInvalidRequestException(ex: InvalidRequestException): ResponseEntity<ErrorResponse> {
        log.error("Invalid request: ${ex.message}", ex)
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "Invalid request")
        return ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(UrlNotFoundException::class)
    fun handleUrlNotFound(ex: UrlNotFoundException): ResponseEntity<ErrorResponse> {
        log.error(LOG_ERROR_MESSAGE, ex)
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "URL not found")
        return ResponseEntity(errorResponse, HttpStatus.NOT_FOUND)
    }

}