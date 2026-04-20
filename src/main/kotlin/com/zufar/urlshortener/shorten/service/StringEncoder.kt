package com.zufar.urlshortener.shorten.service

import java.security.SecureRandom

class StringEncoder {

    companion object {
        private const val BASE_58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
        private const val CODE_LENGTH = 8
        private val secureRandom = SecureRandom()

        fun generate(): String {
            val sb = StringBuilder(CODE_LENGTH)
            repeat(CODE_LENGTH) {
                sb.append(BASE_58_ALPHABET[secureRandom.nextInt(BASE_58_ALPHABET.length)])
            }
            return sb.toString()
        }
    }
}
