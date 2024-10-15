package com.zufar.urlshortener.shorten.repository

import com.zufar.urlshortener.shorten.entity.UrlMapping
import org.springframework.data.mongodb.repository.MongoRepository
import java.util.Optional

interface UrlRepository : MongoRepository<UrlMapping, String> {

    fun findByUrlHash(urlHash: String): Optional<UrlMapping>
}