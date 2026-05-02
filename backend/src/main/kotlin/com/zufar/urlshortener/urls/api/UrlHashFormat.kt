package com.zufar.urlshortener.urls.api

object UrlHashFormat {
    const val LENGTH = 8
    const val BASE58_REGEX = "[1-9A-HJ-NP-Za-km-z]{$LENGTH}"
    const val CUSTOM_ALIAS_REGEX = "[a-zA-Z0-9_-]{3,30}"
    const val COMBINED_REGEX = "$BASE58_REGEX|$CUSTOM_ALIAS_REGEX"
    const val PATH_VARIABLE_REGEX = "/{urlHash:$COMBINED_REGEX}"
    const val SECURITY_REGEX = "^/($COMBINED_REGEX)$"
}
