package com.zufar.urlshortener.users.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class UpdateProfileRequest(
    @field:NotBlank(message = FIRST_NAME_MUST_NOT_BE_EMPTY)
    @field:Size(max = 50, message = FIRST_NAME_IS_TOO_LONG)
    @field:Pattern(regexp = "^[a-zA-Z'-]+$", message = FIRST_NAME_CONTAINS_INVALID_CHARACTERS)
    val firstName: String,

    @field:NotBlank(message = LAST_NAME_MUST_NOT_BE_EMPTY)
    @field:Size(max = 50, message = LAST_NAME_IS_TOO_LONG)
    @field:Pattern(regexp = "^[a-zA-Z'-]+$", message = LAST_NAME_CONTAINS_INVALID_CHARACTERS)
    val lastName: String,

    @field:Size(max = 50, message = COUNTRY_NAME_IS_TOO_LONG)
    @field:Pattern(regexp = "^[a-zA-Z'\\-]+(\\s[a-zA-Z'\\-]+)*$", message = COUNTRY_NAME_CONTAINS_INVALID_CHARACTERS)
    val country: String? = null,

    @field:Min(value = 13, message = AGE_MUST_BE_BETWEEN_13_AND_120)
    @field:Max(value = 120, message = AGE_MUST_BE_BETWEEN_13_AND_120)
    val age: Int? = null
)
