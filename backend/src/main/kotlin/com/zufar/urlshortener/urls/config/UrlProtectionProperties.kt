package com.zufar.urlshortener.urls.config

import jakarta.validation.constraints.Min
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.validation.annotation.Validated

@ConfigurationProperties(prefix = "app.urls.protection")
@Validated
data class UrlProtectionProperties(
    @field:Min(1) val anonymousDailyQuota: Long = 25,
    @field:Min(1) val authenticatedDailyQuota: Long = 250,
    @field:Min(1) val destinationHostDailyQuota: Long = 500,
    @field:Min(1) val rapidCreationBurstThreshold: Long = 5,
    @field:Min(1) val rapidCreationBurstWindowSeconds: Long = 10,
    @field:Min(0) val creationRiskBlockThreshold: Int = 70,
    val safetyInterstitialForAnonymous: Boolean = true,
    val safetyInterstitialForIpDestinations: Boolean = true,
    val safetyInterstitialForHttpDestinations: Boolean = true,
    val safetyInterstitialForSuspiciousDestinations: Boolean = true,
    val safetyInterstitialForAutomation: Boolean = true
)
