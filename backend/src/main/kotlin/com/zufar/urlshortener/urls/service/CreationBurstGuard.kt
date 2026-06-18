package com.zufar.urlshortener.urls.service

import java.time.Instant

fun interface CreationBurstGuard {
    fun recordAndCount(creatorKey: String, now: Instant, windowSeconds: Long): Long
}
