package com.zufar.urlshortener.urls.api

object UrlHashFormat {
    const val LENGTH = 8
    const val REGEX = "[1-9A-HJ-NP-Za-km-z]{$LENGTH}"
    const val PATH_VARIABLE_REGEX = "/{urlHash:$REGEX}"
    const val SECURITY_REGEX = "^/$REGEX$"
}
