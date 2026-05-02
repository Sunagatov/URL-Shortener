package com.zufar.urlshortener.analytics.service

import org.springframework.stereotype.Service
import java.net.URI

data class ReferrerInfo(
    val domain: String?,
    val category: String
)

@Service
class ReferrerClassifier {

    private val categoryMap = mapOf(
        "google.com" to "Google", "google.co.uk" to "Google", "google.de" to "Google",
        "facebook.com" to "Facebook", "m.facebook.com" to "Facebook",
        "instagram.com" to "Instagram", "l.instagram.com" to "Instagram",
        "linkedin.com" to "LinkedIn", "lnkd.in" to "LinkedIn",
        "reddit.com" to "Reddit", "old.reddit.com" to "Reddit",
        "t.co" to "Twitter", "twitter.com" to "Twitter", "x.com" to "Twitter",
        "telegram.me" to "Telegram", "t.me" to "Telegram",
        "whatsapp.com" to "WhatsApp",
        "youtube.com" to "YouTube", "youtu.be" to "YouTube",
        "github.com" to "GitHub",
        "bing.com" to "Bing",
        "duckduckgo.com" to "DuckDuckGo",
        "baidu.com" to "Baidu",
        "pinterest.com" to "Pinterest",
        "tiktok.com" to "TikTok"
    )

    fun classify(rawReferer: String?): ReferrerInfo {
        if (rawReferer.isNullOrBlank()) return ReferrerInfo(null, "Direct")

        val domain = extractDomain(rawReferer) ?: return ReferrerInfo(null, "Direct")
        val category = categoryMap[domain]
            ?: categoryMap[stripWww(domain)]
            ?: stripWww(domain).replaceFirstChar { it.uppercase() }

        return ReferrerInfo(domain, category)
    }

    private fun extractDomain(url: String): String? = try {
        URI(url).host?.lowercase()?.removePrefix("www.")
    } catch (_: Exception) {
        null
    }

    private fun stripWww(domain: String): String = domain.removePrefix("www.")
}
