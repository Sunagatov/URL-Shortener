package com.zufar.urlshortener.exception

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import reactor.core.publisher.Mono
import org.springframework.web.server.ResponseStatusException

@ControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatusException(ex: ResponseStatusException): Mono<ResponseEntity<String>> {
        return Mono.just(
            ResponseEntity(ex.reason, ex.statusCode)
        )
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(ex: IllegalArgumentException): Mono<ResponseEntity<String>> {
        return Mono.just(
            ResponseEntity(ex.message, HttpStatus.BAD_REQUEST)
        )
    }

    @ExceptionHandler(Exception::class)
    fun handleException(ex: Exception): Mono<ResponseEntity<String>> {
        return Mono.just(
            ResponseEntity("An unexpected error occurred", HttpStatus.INTERNAL_SERVER_ERROR)
        )
    }

    @ExceptionHandler(UrlNotFoundException::class)
    fun handleUrlNotFound(ex: UrlNotFoundException): Mono<ResponseEntity<String>> {
        return Mono.just(
            ResponseEntity("Error: ${ex.message}", HttpStatus.NOT_FOUND)
        )
    }
}
