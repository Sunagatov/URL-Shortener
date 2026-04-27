package com.zufar.urlshortener.shorten.dto

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Paginated list of URL mappings")
data class UrlMappingPageDto(

    @Schema(description = "List of URL mappings")
    val content: List<UrlMappingDto>,

    @Schema(description = "Current page number", example = "0")
    val page: Int,

    @Schema(description = "Number of items per page", example = "10")
    val size: Int,

    @Schema(description = "Total number of elements", example = "100")
    val totalElements: Long,

    @Schema(description = "Total number of pages", example = "10")
    val totalPages: Int
)
