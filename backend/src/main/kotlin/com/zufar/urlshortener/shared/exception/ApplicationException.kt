package com.zufar.urlshortener.shared.exception

import org.springframework.http.HttpStatus

open class ApplicationException(
    val status: HttpStatus,
    val code: String,
    override val message: String,
    val retryAfterSeconds: Long? = null
) : RuntimeException(message) {
    companion object {
        fun badRequest(code: String, message: String): ApplicationException =
            ApplicationException(HttpStatus.BAD_REQUEST, code, message)

        fun unauthorized(code: String, message: String): ApplicationException =
            ApplicationException(HttpStatus.UNAUTHORIZED, code, message)

        fun forbidden(code: String, message: String): ApplicationException =
            ApplicationException(HttpStatus.FORBIDDEN, code, message)

        fun notFound(code: String, message: String): ApplicationException =
            ApplicationException(HttpStatus.NOT_FOUND, code, message)

        fun conflict(code: String, message: String): ApplicationException =
            ApplicationException(HttpStatus.CONFLICT, code, message)

        fun tooManyRequests(code: String, message: String, retryAfterSeconds: Long? = null): ApplicationException =
            ApplicationException(HttpStatus.TOO_MANY_REQUESTS, code, message, retryAfterSeconds)
    }
}
