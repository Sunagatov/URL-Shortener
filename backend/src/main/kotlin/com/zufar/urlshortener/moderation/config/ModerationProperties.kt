package com.zufar.urlshortener.moderation.config

import jakarta.validation.constraints.Min
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.validation.annotation.Validated

@ConfigurationProperties(prefix = "app.moderation")
@Validated
data class ModerationProperties(
    val adminUserIds: String = "",
    @field:Min(1) val autoInterstitialReportThreshold: Long = 1,
    @field:Min(1) val autoDisableReportThreshold: Long = 3,
    @field:Min(1) val autoActionWindowHours: Long = 24
) {
    fun adminUserIdSet(): Set<String> =
        adminUserIds.split(",").map(String::trim).filter(String::isNotEmpty).toSet()
}
