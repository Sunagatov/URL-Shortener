package com.zufar.urlshortener.shared.security

import com.zufar.urlshortener.shared.http.ErrorResponseWriter
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.stereotype.Component

@Component
class RestAuthenticationEntryPoint(
    private val errorResponseWriter: ErrorResponseWriter
) : AuthenticationEntryPoint {

    override fun commence(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authException: AuthenticationException
    ) {
        errorResponseWriter.write(response, HttpStatus.UNAUTHORIZED, "Unauthorized access")
    }
}
