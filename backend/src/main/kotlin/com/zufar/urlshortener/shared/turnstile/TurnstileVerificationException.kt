package com.zufar.urlshortener.shared.turnstile

import com.zufar.urlshortener.shared.exception.ApplicationException
import org.springframework.http.HttpStatus

class TurnstileVerificationException(message: String) : ApplicationException(
    status = HttpStatus.BAD_REQUEST,
    code = "TURNSTILE_VERIFICATION_FAILED",
    message = message
)
