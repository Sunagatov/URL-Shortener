package com.zufar.urlshortener.service

import com.zufar.urlshortener.repository.UrlRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.redis.core.ReactiveRedisTemplate
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class UrlRetriever(
    private val urlRepository: UrlRepository,
    @Qualifier("reactiveStringRedisTemplate") private val redisTemplate: ReactiveRedisTemplate<String, String>
) {
    private val log = LoggerFactory.getLogger(UrlRetriever::class.java)

    fun retrieveUrl(shortUrl: String): Mono<String> {
        log.info("Trying to retrieve original URL for shortUrl='{}'", shortUrl)
        return redisTemplate.opsForValue()[shortUrl]
            .switchIfEmpty(
                urlRepository.findByShortUrl(shortUrl)
                    .flatMap { urlMapping ->
                        val originalUrl = urlMapping.originalUrl
                        log.info("Successfully found originalUrl='{}' for shortUrl='{}'", originalUrl, shortUrl)
                        redisTemplate.opsForValue()[shortUrl] = originalUrl
                        Mono.just(originalUrl)
                    }
            )
    }
}
