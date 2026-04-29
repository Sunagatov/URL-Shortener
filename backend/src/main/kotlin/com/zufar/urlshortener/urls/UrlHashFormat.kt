package com.zufar.urlshortener.urls

object UrlHashFormat {
    const val LENGTH = 8
    const val REGEX = "[1-9A-HJ-NP-Za-km-z]{8}"
    const val PATH_VARIABLE_REGEX = "/{urlHash:$REGEX}"
    const val SECURITY_REGEX = "^/$REGEX$"
}
