package com.zufar.urlshortener.exception

import com.zufar.urlshortener.common.dto.ErrorResponse
import org.slf4j.LoggerFactory
import org.springframework.core.codec.DecodingException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.server.ServerWebInputException
import org.springframework.web.server.UnsupportedMediaTypeStatusException
import reactor.core.publisher.Mono

private const val LOG_ERROR_MESSAGE = "An unexpected error occurred"

@ControllerAdvice
class GlobalExceptionHandler {

    private val log = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(ServerWebInputException::class)
    fun handleServerWebInputException(ex: ServerWebInputException): Mono<ResponseEntity<ErrorResponse>> {
        log.error(LOG_ERROR_MESSAGE, ex)

        val errorMessage = if (ex.cause is DecodingException) {
            log.error(LOG_ERROR_MESSAGE, ex)
            "Malformed JSON or invalid data"
        } else {
            log.error(LOG_ERROR_MESSAGE, ex)
            "Incorrect request schema"
        }

        val errorResponse = ErrorResponse(errorMessage = errorMessage)
        return Mono.just(
            ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
        )
    }

    @ExceptionHandler(UnsupportedMediaTypeStatusException::class)
    fun handleUnsupportedMediaTypeStatusException(ex: UnsupportedMediaTypeStatusException): Mono<ResponseEntity<ErrorResponse>> {
        log.error(LOG_ERROR_MESSAGE, ex)
        val errorResponse = ErrorResponse(errorMessage = "Incorrect request")
        return Mono.just(
            ResponseEntity(errorResponse, ex.statusCode)
        )
    }

    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatusException(ex: ResponseStatusException): Mono<ResponseEntity<ErrorResponse>> {
        log.error(LOG_ERROR_MESSAGE, ex)
        val errorResponse = ErrorResponse(errorMessage = ex.reason ?: "Unexpected error")
        return Mono.just(
            ResponseEntity(errorResponse, ex.statusCode)
        )
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(ex: IllegalArgumentException): Mono<ResponseEntity<ErrorResponse>> {
        log.error(LOG_ERROR_MESSAGE, ex)
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "Invalid input")
        return Mono.just(
            ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
        )
    }

    @ExceptionHandler(UrlNotFoundException::class)
    fun handleUrlNotFound(ex: UrlNotFoundException): Mono<ResponseEntity<ErrorResponse>> {
        log.error(LOG_ERROR_MESSAGE, ex)
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "URL not found")
        return Mono.just(
            ResponseEntity(errorResponse, HttpStatus.NOT_FOUND)
        )
    }

    @ExceptionHandler(Exception::class)
    fun handleException(ex: Exception): Mono<ResponseEntity<ErrorResponse>> {
        log.error(LOG_ERROR_MESSAGE, ex)
        val errorMessage = "An unexpected error occurred: ${ex.message ?: "No additional details provided"}"
        val errorResponse = ErrorResponse(errorMessage = errorMessage)
        return Mono.just(
            ResponseEntity(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR)
        )
    }
}
