package com.zufar.urlshortener.shared.http

import com.fasterxml.jackson.databind.ObjectMapper
import com.zufar.urlshortener.shared.exception.ErrorResponse
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component

@Component
class ErrorResponseWriter {
    private val objectMapper = ObjectMapper()

    fun write(response: HttpServletResponse, status: HttpStatus, message: String) {
        response.status = status.value()
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.writer.write(
            objectMapper.writeValueAsString(
                ErrorResponse(errorMessage = message)
            )
        )
    }
}
