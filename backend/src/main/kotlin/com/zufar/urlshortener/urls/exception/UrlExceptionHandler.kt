package com.zufar.urlshortener.urls.exception

import com.zufar.urlshortener.shared.exception.ErrorResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

private const val URL_NOT_FOUND_CODE = "URL_NOT_FOUND"

@RestControllerAdvice(basePackages = ["com.zufar.urlshortener.urls"])
@Suppress("unused")
class UrlExceptionHandler {

    @ExceptionHandler(UrlNotFoundException::class)
    fun handleUrlNotFound(
        ex: UrlNotFoundException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            ErrorResponse.of(request, HttpStatus.NOT_FOUND, ex.message ?: "URL not found", URL_NOT_FOUND_CODE)
        )
}
