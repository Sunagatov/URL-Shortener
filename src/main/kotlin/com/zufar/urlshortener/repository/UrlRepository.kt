package com.zufar.urlshortener.repository

import com.zufar.urlshortener.common.entity.UrlMapping
import org.springframework.data.mongodb.repository.MongoRepository
import java.util.Optional

interface UrlRepository : MongoRepository<UrlMapping, String> {

    fun findByShortUrl(shortUrl: String): Optional<UrlMapping>
}