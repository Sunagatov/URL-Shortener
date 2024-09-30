package com.zufar.urlshortener.service

import org.springframework.stereotype.Service

private const val MIN_ALLOWED_DAYS_COUNT = 1L
private const val MAX_ALLOWED_DAYS_COUNT = 365L

@Service
class DaysCountValidator {

    fun validateDaysCount(daysCount: Long?) {
        if (daysCount == null) {
            return
        }
        require(daysCount >= MIN_ALLOWED_DAYS_COUNT) { "Days count must be at least $MIN_ALLOWED_DAYS_COUNT day(s)." }
        require(daysCount <= MAX_ALLOWED_DAYS_COUNT) { "Days count must not exceed $MAX_ALLOWED_DAYS_COUNT day(s)." }
    }
}
