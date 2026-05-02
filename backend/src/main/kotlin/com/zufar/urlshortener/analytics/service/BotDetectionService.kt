package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.entity.BotCategory
import com.zufar.urlshortener.analytics.entity.DeviceType
import org.springframework.stereotype.Service

data class BotInfo(
    val isBot: Boolean,
    val category: BotCategory?
)

@Service
class BotDetectionService {

    private val searchCrawlers = listOf(
        "googlebot", "bingbot", "yandexbot", "baiduspider", "duckduckbot", "slurp",
        "sogou", "exabot", "ia_archiver", "mj12bot", "ahrefsbot", "semrushbot",
        "dotbot", "rogerbot", "seznambot", "applebot", "petalbot", "bytespider"
    )
    private val socialPreviews = listOf(
        "facebookexternalhit", "twitterbot", "linkedinbot", "whatsapp", "telegrambot",
        "slackbot", "discordbot", "skypeuripreview", "vkshare", "pinterestbot",
        "redditbot", "embedly", "quora link preview", "outbrain", "tumblr/"
    )
    private val uptimeMonitors = listOf(
        "uptimerobot", "pingdom", "statuscake", "site24x7", "newrelic",
        "datadog", "checkly", "freshping", "hetrixtools", "montastic"
    )
    private val genericBots = listOf(
        "bot/", "bot;", "crawler", "spider", "scraper", "curl/", "wget/",
        "python-requests", "python-urllib", "go-http-client", "java/",
        "apache-httpclient", "okhttp", "httpie", "postman", "insomnia",
        "node-fetch", "axios/", "libwww-perl", "mechanize", "scrapy",
        "headlesschrome", "phantomjs", "selenium", "puppeteer", "playwright"
    )

    fun detect(userAgent: String?, deviceType: DeviceType): BotInfo {
        if (userAgent.isNullOrBlank()) return BotInfo(false, null)

        val ua = userAgent.lowercase()

        return when {
            searchCrawlers.any { ua.contains(it) } -> BotInfo(true, BotCategory.SEARCH_CRAWLER)
            socialPreviews.any { ua.contains(it) } -> BotInfo(true, BotCategory.SOCIAL_PREVIEW)
            uptimeMonitors.any { ua.contains(it) } -> BotInfo(true, BotCategory.UPTIME_MONITOR)
            genericBots.any { ua.contains(it) } -> BotInfo(true, BotCategory.GENERIC_AUTOMATION)
            deviceType == DeviceType.BOT -> BotInfo(true, BotCategory.UNKNOWN_BOT)
            else -> BotInfo(false, null)
        }
    }
}
