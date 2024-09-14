package com.zufar.urlshortener.exception

import com.zufar.urlshortener.common.dto.ErrorResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import reactor.core.publisher.Mono
import org.springframework.web.server.ResponseStatusException

@ControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatusException(ex: ResponseStatusException): Mono<ResponseEntity<ErrorResponse>> {
        val errorResponse = ErrorResponse(errorMessage = ex.reason ?: "Unexpected error")
        return Mono.just(
            ResponseEntity(errorResponse, ex.statusCode)
        )
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(ex: IllegalArgumentException): Mono<ResponseEntity<ErrorResponse>> {
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "Invalid input")
        return Mono.just(
            ResponseEntity(errorResponse, HttpStatus.BAD_REQUEST)
        )
    }

    @ExceptionHandler(Exception::class)
    fun handleException(ex: Exception): Mono<ResponseEntity<ErrorResponse>> {
        val errorResponse = ErrorResponse(errorMessage = "An unexpected error occurred")
        return Mono.just(
            ResponseEntity(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR)
        )
    }

    @ExceptionHandler(UrlNotFoundException::class)
    fun handleUrlNotFound(ex: UrlNotFoundException): Mono<ResponseEntity<ErrorResponse>> {
        val errorResponse = ErrorResponse(errorMessage = ex.message ?: "URL not found")
        return Mono.just(
            ResponseEntity(errorResponse, HttpStatus.NOT_FOUND)
        )
    }
}
