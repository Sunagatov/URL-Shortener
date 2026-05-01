package com.zufar.urlshortener.urls.exception

import com.zufar.urlshortener.shared.web.ErrorResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

private const val URL_NOT_FOUND_CODE = "URL_NOT_FOUND"
private const val INVALID_URL_REQUEST_CODE = "INVALID_URL_REQUEST"

@RestControllerAdvice(basePackages = ["com.zufar.urlshortener.urls"])
@Suppress("unused")
class UrlExceptionHandler {

    @ExceptionHandler(InvalidUrlRequestException::class)
    fun handleInvalidUrlRequest(
        ex: InvalidUrlRequestException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            ErrorResponse.of(request, HttpStatus.BAD_REQUEST, ex.message ?: "Invalid URL request", INVALID_URL_REQUEST_CODE)
        )

    @ExceptionHandler(UrlNotFoundException::class)
    fun handleUrlNotFound(
        ex: UrlNotFoundException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            ErrorResponse.of(request, HttpStatus.NOT_FOUND, ex.message ?: "URL not found", URL_NOT_FOUND_CODE)
        )
}
