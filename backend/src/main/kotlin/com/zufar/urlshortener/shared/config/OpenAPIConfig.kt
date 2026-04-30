package com.zufar.urlshortener.shared.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import org.springdoc.core.models.GroupedOpenApi
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class OpenAPIConfig {

    @Bean
    fun openApiMetadata(): OpenAPI =
        OpenAPI().info(
            Info()
                .title("URL Shortener API")
                .version("1.0")
                .description("API documentation for URL Shortener")
        )

    @Bean
    fun publicApi(): GroupedOpenApi =
        GroupedOpenApi.builder()
            .group("public")
            .pathsToMatch("/**")
            .build()
}
