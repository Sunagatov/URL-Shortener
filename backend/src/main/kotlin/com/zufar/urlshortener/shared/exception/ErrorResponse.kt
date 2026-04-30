package com.zufar.urlshortener.shared.exception

import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import java.time.Instant

data class ErrorResponse(
    val errorMessage: String,
    val code: String,
    val status: Int,
    val path: String,
    val requestId: String?,
    val timestamp: Instant,
    val retryAfterSeconds: Long? = null
) {
    companion object {
        private const val REQUEST_ID_ATTRIBUTE = "requestId"

        fun of(
            request: HttpServletRequest?,
            status: HttpStatus,
            message: String,
            code: String = status.name,
            retryAfterSeconds: Long? = null
        ): ErrorResponse = ErrorResponse(
            errorMessage = message,
            code = code,
            status = status.value(),
            path = request?.requestURI ?: "-",
            requestId = request?.getAttribute(REQUEST_ID_ATTRIBUTE)?.toString(),
            timestamp = Instant.now(),
            retryAfterSeconds = retryAfterSeconds
        )
    }
}
