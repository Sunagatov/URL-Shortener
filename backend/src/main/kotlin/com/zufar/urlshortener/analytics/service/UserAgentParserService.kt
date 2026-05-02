package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.entity.DeviceType
import org.springframework.stereotype.Service
import ua_parser.Parser

data class UserAgentInfo(
    val deviceType: DeviceType,
    val browser: String?,
    val browserVersionMajor: String?,
    val operatingSystem: String?,
    val operatingSystemVersionMajor: String?
)

@Service
class UserAgentParserService {

    private val parser = Parser()

    fun parse(userAgent: String?): UserAgentInfo {
        if (userAgent.isNullOrBlank()) return unknown()

        return try {
            val client = parser.parse(userAgent)
            UserAgentInfo(
                deviceType = resolveDeviceType(client.device?.family, client.os?.family),
                browser = client.userAgent?.family,
                browserVersionMajor = client.userAgent?.major,
                operatingSystem = client.os?.family,
                operatingSystemVersionMajor = client.os?.major
            )
        } catch (_: Exception) {
            unknown()
        }
    }

    private fun resolveDeviceType(deviceFamily: String?, osFamily: String?): DeviceType {
        val device = deviceFamily?.lowercase() ?: ""
        val os = osFamily?.lowercase() ?: ""

        return when {
            device == "spider" -> DeviceType.BOT
            os.contains("android") || os.contains("ios") || device.contains("iphone") || device.contains("phone") -> DeviceType.MOBILE
            device.contains("ipad") || device.contains("tablet") -> DeviceType.TABLET
            os.contains("windows") || os.contains("mac os") || os.contains("linux") || os.contains("chrome os") -> DeviceType.DESKTOP
            else -> DeviceType.UNKNOWN
        }
    }

    private fun unknown() = UserAgentInfo(DeviceType.UNKNOWN, null, null, null, null)
}
