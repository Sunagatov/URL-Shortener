package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.shared.config.RateLimitConfig
import com.zufar.urlshortener.shared.config.RateLimitProperties
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.security.AuditLogService
import com.zufar.urlshortener.urls.config.UrlProtectionProperties
import com.zufar.urlshortener.urls.repository.UrlRepository

fun testUrlCreationProtectionService(urlRepository: UrlRepository): UrlCreationProtectionService =
    UrlCreationProtectionService(
        urlRepository = urlRepository,
        clientIpResolver = ClientIpResolver(RateLimitConfig(RateLimitProperties())),
        protectionProperties = UrlProtectionProperties(),
        auditLogService = AuditLogService()
    )

fun testAuditLogService(): AuditLogService = AuditLogService()
