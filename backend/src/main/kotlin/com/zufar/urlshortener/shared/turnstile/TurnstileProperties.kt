package com.zufar.urlshortener.shared.turnstile

import jakarta.validation.constraints.AssertTrue
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.validation.annotation.Validated
import java.time.Duration

@ConfigurationProperties(prefix = "turnstile")
@Validated
data class TurnstileProperties(
    val enabled: Boolean = false,
    val authEnabled: Boolean = false,
    val urlCreateEnabled: Boolean = false,
    val secretKey: String = "",
    val connectTimeout: Duration = Duration.ofSeconds(2),
    val readTimeout: Duration = Duration.ofSeconds(3)
) {
    @AssertTrue(message = "turnstile.enabled must be true when feature-specific Turnstile protection is enabled")
    fun isFeatureConfigurationValid(): Boolean =
        enabled || (!authEnabled && !urlCreateEnabled)

    @AssertTrue(message = "turnstile.secret-key must be configured when turnstile.enabled=true")
    fun isSecretConfigurationValid(): Boolean =
        !enabled || secretKey.isNotBlank()

    @AssertTrue(message = "turnstile.connect-timeout must be positive")
    fun isConnectTimeoutValid(): Boolean =
        !connectTimeout.isZero && !connectTimeout.isNegative

    @AssertTrue(message = "turnstile.read-timeout must be positive")
    fun isReadTimeoutValid(): Boolean =
        !readTimeout.isZero && !readTimeout.isNegative
}
