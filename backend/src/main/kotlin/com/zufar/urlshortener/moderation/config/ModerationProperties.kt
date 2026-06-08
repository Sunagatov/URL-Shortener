package com.zufar.urlshortener.moderation.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app.moderation")
data class ModerationProperties(
    val adminUserIds: String = ""
) {
    fun adminUserIdSet(): Set<String> =
        adminUserIds.split(",").map(String::trim).filter(String::isNotEmpty).toSet()
}
