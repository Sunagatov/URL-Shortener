package com.zufar.urlshortener.shorten.repository

import com.zufar.urlshortener.shorten.entity.UrlMapping
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import java.time.LocalDateTime
import java.util.Optional

interface UrlRepository : MongoRepository<UrlMapping, String> {

    fun findByUrlHash(urlHash: String): Optional<UrlMapping>

    fun findAllByUserId(userId: String, pageable: Pageable): Page<UrlMapping>

    fun findAllByUserIdAndExpirationDateAfter(userId: String, now: LocalDateTime, pageable: Pageable): Page<UrlMapping>

    fun deleteAllByExpirationDateBefore(date: LocalDateTime)
}