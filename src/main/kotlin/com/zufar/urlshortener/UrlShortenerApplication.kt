package com.zufar.urlshortener

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.info.Info
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
@OpenAPIDefinition(
    info = Info(
        title = "URL Shortener API",
        version = "1.0",
        description = "API documentation for URL Shortener"
    )
)
class UrlShortenerApplication

fun main(args: Array<String>) {
    runApplication<UrlShortenerApplication>(*args)
}
