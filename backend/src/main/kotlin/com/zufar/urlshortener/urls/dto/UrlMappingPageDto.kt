package com.zufar.urlshortener.urls.dto


data class UrlMappingPageDto(

    val content: List<UrlMappingDto>,

    val page: Int,

    val size: Int,

    val totalElements: Long,

    val totalPages: Int
)
