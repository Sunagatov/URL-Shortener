package com.zufar.urlshortener.urls.validation

import com.zufar.urlshortener.shared.exception.InvalidRequestException
import org.springframework.stereotype.Component

private const val MAX_PAGE_SIZE = 100

@Component
class UrlMappingsPageRequestValidator {

    fun validate(page: Int, size: Int) {
        if (page < 0) {
            throw InvalidRequestException("Page must be greater than or equal to 0")
        }
        if (size !in 1..MAX_PAGE_SIZE) {
            throw InvalidRequestException("Size must be between 1 and $MAX_PAGE_SIZE")
        }
    }
}
