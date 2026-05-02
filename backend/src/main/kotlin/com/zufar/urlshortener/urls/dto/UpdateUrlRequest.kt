package com.zufar.urlshortener.urls.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class UpdateUrlRequest(
    @field:NotBlank(message = "URL cannot be blank")
    @field:Size(max = 2048, message = "URL too long")
    val originalUrl: String
)
