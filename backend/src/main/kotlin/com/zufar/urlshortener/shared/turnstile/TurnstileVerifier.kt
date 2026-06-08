package com.zufar.urlshortener.shared.turnstile

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.stereotype.Component
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.RestClient

private const val VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

@Component
class TurnstileVerifier internal constructor(
    private val properties: TurnstileProperties,
    private val client: RestClient
) {
    private val log = LoggerFactory.getLogger(TurnstileVerifier::class.java)

    @Autowired
    constructor(properties: TurnstileProperties) : this(properties, restClient(properties))

    fun verify(token: String?, expectedActions: Set<String> = emptySet()) {
        if (!properties.enabled) {
            return
        }

        if (token.isNullOrBlank()) {
            throw TurnstileVerificationException("Turnstile verification required")
        }

        try {
            val form = LinkedMultiValueMap<String, String>().apply {
                add("secret", properties.secretKey.trim())
                add("response", token)
            }

            val result = client
                .post()
                .uri(VERIFY_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(TurnstileResponse::class.java)

            if (result?.success != true) {
                log.info("turnstile_verification_failed errorCodes={}", result?.errorCodes.orEmpty())
                throw TurnstileVerificationException("Turnstile verification failed")
            }

            if (expectedActions.isNotEmpty() && result.action !in expectedActions) {
                log.info(
                    "turnstile_action_mismatch expectedActions={} receivedAction={}",
                    expectedActions,
                    result.action
                )
                throw TurnstileVerificationException("Turnstile verification failed")
            }
        } catch (ex: TurnstileVerificationException) {
            throw ex
        } catch (ex: Exception) {
            log.error("turnstile_service_error message={}", ex.message)
            throw TurnstileVerificationException("Turnstile service unavailable")
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private data class TurnstileResponse(
        @JsonProperty("success") val success: Boolean = false,
        @JsonProperty("action") val action: String? = null,
        @JsonProperty("error-codes") val errorCodes: List<String> = emptyList()
    )

    companion object {
        private fun restClient(properties: TurnstileProperties): RestClient {
            val requestFactory = SimpleClientHttpRequestFactory().apply {
                setConnectTimeout(properties.connectTimeout)
                setReadTimeout(properties.readTimeout)
            }
            return RestClient.builder().requestFactory(requestFactory).build()
        }
    }
}
