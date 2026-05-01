package com.zufar.urlshortener.frontendlogs.exception

import com.zufar.urlshortener.shared.web.ErrorResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

private const val INVALID_FRONTEND_LOG_REQUEST_CODE = "INVALID_FRONTEND_LOG_REQUEST"

@RestControllerAdvice(basePackages = ["com.zufar.urlshortener.frontendlogs"])
@Suppress("unused")
class FrontendLogsExceptionHandler {

    @ExceptionHandler(InvalidFrontendLogRequestException::class)
    fun handleInvalidFrontendLogRequest(
        ex: InvalidFrontendLogRequestException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            ErrorResponse.of(
                request,
                HttpStatus.BAD_REQUEST,
                ex.message ?: "Invalid frontend log request",
                INVALID_FRONTEND_LOG_REQUEST_CODE
            )
        )
}
