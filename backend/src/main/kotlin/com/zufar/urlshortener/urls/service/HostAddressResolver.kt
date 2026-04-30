package com.zufar.urlshortener.urls.service

import org.springframework.stereotype.Component
import java.net.InetAddress

fun interface HostAddressResolver {
    fun resolve(host: String): Array<InetAddress>
}

@Component
class DefaultHostAddressResolver : HostAddressResolver {
    override fun resolve(host: String): Array<InetAddress> = InetAddress.getAllByName(host)
}
