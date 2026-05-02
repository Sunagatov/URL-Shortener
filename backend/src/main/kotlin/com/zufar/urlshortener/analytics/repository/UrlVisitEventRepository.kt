package com.zufar.urlshortener.analytics.repository

import com.zufar.urlshortener.analytics.entity.UrlVisitEvent
import org.springframework.data.mongodb.repository.MongoRepository

interface UrlVisitEventRepository : MongoRepository<UrlVisitEvent, String>
