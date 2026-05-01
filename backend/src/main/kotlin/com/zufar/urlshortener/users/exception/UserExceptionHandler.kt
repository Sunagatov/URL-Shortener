package com.zufar.urlshortener.users.exception

import com.zufar.urlshortener.shared.web.ErrorResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

private const val INVALID_USER_REQUEST_CODE = "INVALID_USER_REQUEST"

@RestControllerAdvice(basePackages = ["com.zufar.urlshortener.users"])
@Suppress("unused")
class UserExceptionHandler {

    @ExceptionHandler(InvalidUserRequestException::class)
    fun handleInvalidUserRequest(
        ex: InvalidUserRequestException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            ErrorResponse.of(
                request,
                HttpStatus.BAD_REQUEST,
                ex.message ?: "Invalid user request",
                INVALID_USER_REQUEST_CODE
            )
        )
}
