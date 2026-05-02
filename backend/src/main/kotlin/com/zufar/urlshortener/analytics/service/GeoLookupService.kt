package com.zufar.urlshortener.analytics.service

import com.maxmind.geoip2.DatabaseReader
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.io.File
import java.net.InetAddress

data class GeoInfo(
    val countryCode: String?,
    val city: String?
)

@Service
class GeoLookupService {

    private val log = LoggerFactory.getLogger(GeoLookupService::class.java)
    private val reader: DatabaseReader? = initReader()

    fun lookup(ip: String?): GeoInfo {
        if (ip.isNullOrBlank() || reader == null) return GeoInfo(null, null)

        return try {
            val address = InetAddress.getByName(ip)
            val response = reader.city(address)
            GeoInfo(
                countryCode = response.country?.isoCode,
                city = response.city?.name
            )
        } catch (_: Exception) {
            GeoInfo(null, null)
        }
    }

    private fun initReader(): DatabaseReader? {
        val dbPath = System.getenv("GEOIP_DB_PATH") ?: "/opt/geoip/GeoLite2-City.mmdb"
        val file = File(dbPath)
        if (!file.exists()) {
            log.warn("GeoIP database not found at {}. Geo lookup disabled.", dbPath)
            return null
        }
        return try {
            DatabaseReader.Builder(file).build()
        } catch (e: Exception) {
            log.warn("Failed to load GeoIP database: {}. Geo lookup disabled.", e.message)
            null
        }
    }
}
