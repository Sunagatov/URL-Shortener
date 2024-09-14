package com.zufar.urlshortener.common.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Represents an error response with an errorMessage")
data class ErrorResponse(

    @Schema(description = "Detailed error message")
    val errorMessage: String
)
