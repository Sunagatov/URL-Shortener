package com.zufar.urlshortener.shared.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import java.util.concurrent.TimeUnit

@Configuration
class CorsConfig {

    @Value("\${cors.allowed.origins}")
    private lateinit var allowedOrigins: String

    @Value("\${cors.allowed.origin-patterns:http://localhost:*,http://127.0.0.1:*}")
    private lateinit var allowedOriginPatterns: String

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOrigins = allowedOrigins.split(",").map { it.trim() }
        configuration.allowedOriginPatterns = allowedOriginPatterns.split(",").map { it.trim() }
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
        configuration.allowedHeaders = listOf("*")
        configuration.exposedHeaders = listOf("Authorization", "Content-Type")
        configuration.allowCredentials = true
        configuration.maxAge = TimeUnit.HOURS.toSeconds(1)
        
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}
