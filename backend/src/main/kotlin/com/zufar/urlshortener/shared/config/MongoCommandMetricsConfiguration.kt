package com.zufar.urlshortener.shared.config

import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.binder.mongodb.MongoMetricsCommandListener
import org.springframework.boot.mongodb.autoconfigure.MongoClientSettingsBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration(proxyBeanMethods = false)
class MongoCommandMetricsConfiguration {
    @Bean
    fun mongoCommandMetrics(registry: MeterRegistry) = MongoClientSettingsBuilderCustomizer { builder ->
        builder.addCommandListener(MongoMetricsCommandListener(registry))
    }
}
