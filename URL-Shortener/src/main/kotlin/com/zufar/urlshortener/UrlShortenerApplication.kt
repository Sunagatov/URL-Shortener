package com.zufar.urlshortener

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class UrlShortenerApplication

fun main(args: Array<String>) {
    runApplication<UrlShortenerApplication>(*args)
}
