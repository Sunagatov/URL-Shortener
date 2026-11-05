package com.zufar.urlshortener.urls.repository

import com.zufar.urlshortener.urls.entity.UrlMapping
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.Update
import java.time.Instant
import java.util.Optional

interface UrlRepository : MongoRepository<UrlMapping, String> {

    @Query("{'_id': ?0, 'disabled': {'\$ne': true}}")
    @Update("{'\$set': {'safetyInterstitialRequired': true, 'safetyInterstitialReason': 'abuse_reported'}}")
    fun requireSafetyInterstitial(urlHash: String): Long

    @Query("{'_id': ?0, 'disabled': {'\$ne': true}}")
    @Update(pipeline = ["{'\$set': {'originalUrl': ?1, 'targetHost': ?2, " +
        "'safetyInterstitialRequired': {'\$cond': [{'\$eq': ['\$safetyInterstitialReason', 'abuse_reported']}, true, ?3]}, " +
        "'safetyInterstitialReason': {'\$cond': [{'\$eq': ['\$safetyInterstitialReason', 'abuse_reported']}, 'abuse_reported', ?4]}}}"])
    fun updateDestination(urlHash: String, originalUrl: String, targetHost: String?, requiresWarning: Boolean, warningReason: String?): Long

    fun findByUrlHash(urlHash: String): Optional<UrlMapping>

    fun findAllByUserIdAndExpirationDateAfter(userId: String,
                                              now: Instant,
                                              pageable: Pageable): Page<UrlMapping>

    fun countByCreatorKeyAndCreatedAtAfter(creatorKey: String, createdAt: Instant): Long

    fun countByTargetHostAndCreatedAtAfter(targetHost: String, createdAt: Instant): Long
}
