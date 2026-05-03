package com.zufar.urlshortener.urls.repository

import com.zufar.urlshortener.urls.entity.UrlMapping
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import java.time.Instant
import java.util.Optional

interface UrlRepository : MongoRepository<UrlMapping, String> {

    fun findByUrlHash(urlHash: String): Optional<UrlMapping>

    fun findAllByUserIdAndExpirationDateAfter(userId: String,
                                              now: Instant,
                                              pageable: Pageable): Page<UrlMapping>
}
