package com.zufar.urlshortener.moderation.config

import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@EnableConfigurationProperties(ModerationProperties::class)
class ModerationConfig
