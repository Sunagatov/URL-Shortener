package com.zufar.urlshortener.urls.service

import java.net.IDN
import java.net.URI
import java.text.Normalizer
import java.util.Locale

/** Canonicalize the authority without changing the destination's path, query or fragment. */
object UrlDestinationNormalizer {
    fun normalize(value: String): String = runCatching {
        val uri = URI(value)
        val scheme = uri.scheme?.lowercase(Locale.ROOT) ?: return value
        val authority = uri.rawAuthority ?: return value
        // Preserve malformed/credential-bearing inputs for the authoritative validator to reject.
        if (authority.contains('@')) return value
        val asciiAuthority = if (uri.host != null) {
            uri.host.lowercase(Locale.ROOT) + authority.substring(uri.host.length)
        } else {
            val host = authority.substringBefore(':')
            val ascii = IDN.toASCII(host, IDN.USE_STD3_ASCII_RULES).lowercase(Locale.ROOT)
            // IDNA2003 can map a distinct name (e.g. sharp-s) to another ASCII domain.
            // Never silently redirect there; browser clients supply the canonical A-label.
            if (!IDN.toUnicode(ascii).equals(Normalizer.normalize(host, Normalizer.Form.NFC), ignoreCase = true)) return value
            ascii + authority.substring(host.length)
        }
        URI("$scheme://$asciiAuthority${value.substring(value.indexOf("://") + 3 + authority.length)}").toASCIIString()
    }.getOrDefault(value)
}
