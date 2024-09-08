package com.zufar.urlshortener.repository

import com.zufar.urlshortener.common.entity.UrlMapping
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import reactor.core.publisher.Mono

interface UrlRepository : ReactiveMongoRepository<UrlMapping, String> {

    fun findByShortUrl(shortUrl: String): Mono<UrlMapping>
}
