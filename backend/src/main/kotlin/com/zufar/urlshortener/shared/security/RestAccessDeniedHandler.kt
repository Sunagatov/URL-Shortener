package com.zufar.urlshortener.shared.security

import com.zufar.urlshortener.shared.http.ErrorResponseWriter
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.web.access.AccessDeniedHandler
import org.springframework.stereotype.Component

@Component
class RestAccessDeniedHandler(
    private val errorResponseWriter: ErrorResponseWriter
) : AccessDeniedHandler {

    override fun handle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        accessDeniedException: AccessDeniedException
    ) {
        errorResponseWriter.write(
            request,
            response,
            HttpStatus.FORBIDDEN,
            accessDeniedException.message ?: "Access denied"
        )
    }
}
