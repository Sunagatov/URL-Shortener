package com.zufar.urlshortener.encoder

import java.nio.charset.StandardCharsets
import java.util.zip.CRC32

class StringEncoder {

    companion object {
        private const val BASE_58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
        private const val BASE = 58

        fun encode(input: String): String {
            val id = stringToLong(input)
            val encoded = StringBuilder()

            var number = id
            while (number > 0) {
                val remainder = (number % BASE).toInt()
                encoded.insert(0, BASE_58_ALPHABET[remainder])
                number /= BASE
            }

            return encoded.toString()
        }

        private fun stringToLong(input: String): Long {
            val crc = CRC32()
            crc.update(input.toByteArray(StandardCharsets.UTF_8))
            return crc.value
        }
    }
}