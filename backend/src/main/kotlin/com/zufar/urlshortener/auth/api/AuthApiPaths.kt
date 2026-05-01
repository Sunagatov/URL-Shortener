package com.zufar.urlshortener.auth.api

object AuthApiPaths {
    const val BASE_PATH = "/api/v1/auth"
    const val LEGACY_BASE_PATH = "/v1/auth"
    const val SECURITY_PATTERN = "$BASE_PATH/**"
    const val LEGACY_SECURITY_PATTERN = "$LEGACY_BASE_PATH/**"
}
