package com.zufar.urlshortener.common.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "urls-mapping")
data class UrlMapping(

    @Id
    val shortUrl: String,

    val originalUrl: String
)
