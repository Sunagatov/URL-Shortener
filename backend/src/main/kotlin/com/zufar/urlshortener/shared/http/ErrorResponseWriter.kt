package com.zufar.urlshortener.shared.http

import com.zufar.urlshortener.shared.exception.ErrorResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper

@Component
class ErrorResponseWriter(
    private val objectMapper: ObjectMapper
) {

    fun write(
        request: HttpServletRequest,
        response: HttpServletResponse,
        status: HttpStatus,
        message: String,
        code: String = status.name,
        retryAfterSeconds: Long? = null
    ) {
        response.status = status.value()
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.writer.write(
            objectMapper.writeValueAsString(
                ErrorResponse.of(request, status, message, code, retryAfterSeconds)
            )
        )
    }
}
