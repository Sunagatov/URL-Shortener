package com.zufar.urlshortener

import org.springframework.boot.fromApplication
import org.springframework.boot.with


fun main(args: Array<String>) {
    fromApplication<UrlShortenerApplication>().with(TestcontainersConfiguration::class).run(*args)
}
