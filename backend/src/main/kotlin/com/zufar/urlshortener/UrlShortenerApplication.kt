package com.zufar.urlshortener

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.annotation.EnableScheduling

@EnableAsync
@EnableScheduling
@SpringBootApplication
class UrlShortenerApplication

fun main(args: Array<String>) {
    runApplication<UrlShortenerApplication>(*args)
}
