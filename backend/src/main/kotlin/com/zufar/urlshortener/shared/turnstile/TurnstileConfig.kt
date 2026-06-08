package com.zufar.urlshortener.shared.turnstile

import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@EnableConfigurationProperties(TurnstileProperties::class)
class TurnstileConfig
