package com.zufar.urlshortener.shared.turnstile

import org.junit.jupiter.api.Test
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.test.web.client.ExpectedCount
import org.springframework.test.web.client.MockRestServiceServer
import org.springframework.test.web.client.match.MockRestRequestMatchers.content
import org.springframework.test.web.client.match.MockRestRequestMatchers.method
import org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo
import org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess
import org.springframework.web.client.RestClient
import kotlin.test.assertFailsWith

private const val VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

class TurnstileVerifierTest {

    @Test
    fun `verify accepts a successful token with the expected action`() {
        val builder = RestClient.builder()
        val server = MockRestServiceServer.bindTo(builder).build()
        val verifier = verifier(builder)

        server.expect(ExpectedCount.once(), requestTo(VERIFY_URL))
            .andExpect(method(HttpMethod.POST))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("secret=test-secret")))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("response=token-123")))
            .andRespond(withSuccess("""{"success":true,"action":"signin","hostname":"zuf.uk"}""", MediaType.APPLICATION_JSON))

        verifier.verify("token-123", setOf("signin"))

        server.verify()
    }

    @Test
    fun `verify rejects a successful token with a different action`() {
        val builder = RestClient.builder()
        val server = MockRestServiceServer.bindTo(builder).build()
        val verifier = verifier(builder)

        server.expect(ExpectedCount.once(), requestTo(VERIFY_URL))
            .andExpect(method(HttpMethod.POST))
            .andRespond(withSuccess("""{"success":true,"action":"url_create"}""", MediaType.APPLICATION_JSON))

        assertFailsWith<TurnstileVerificationException> {
            verifier.verify("token-123", setOf("signin"))
        }

        server.verify()
    }

    @Test
    fun `verify rejects a failed siteverify response`() {
        val builder = RestClient.builder()
        val server = MockRestServiceServer.bindTo(builder).build()
        val verifier = verifier(builder)

        server.expect(ExpectedCount.once(), requestTo(VERIFY_URL))
            .andExpect(method(HttpMethod.POST))
            .andRespond(
                withSuccess(
                    """{"success":false,"error-codes":["timeout-or-duplicate"]}""",
                    MediaType.APPLICATION_JSON
                )
            )

        assertFailsWith<TurnstileVerificationException> {
            verifier.verify("token-123", setOf("signin"))
        }

        server.verify()
    }

    @Test
    fun `verify skips network validation when Turnstile is disabled`() {
        val builder = RestClient.builder()
        val server = MockRestServiceServer.bindTo(builder).build()
        val verifier = TurnstileVerifier(
            TurnstileProperties(enabled = false),
            builder.build()
        )

        verifier.verify(null, setOf("signin"))

        server.verify()
    }

    @Test
    fun `verify rejects missing hostname and tokens issued for another site`() {
        for (hostname in listOf("", ",\"hostname\":\"other.example\"")) {
            val builder = RestClient.builder()
            val server = MockRestServiceServer.bindTo(builder).build()
            server.expect(requestTo(VERIFY_URL)).andRespond(withSuccess(
                """{"success":true,"action":"signin"$hostname}""", MediaType.APPLICATION_JSON))
            assertFailsWith<TurnstileVerificationException> { verifier(builder).verify("token", setOf("signin")) }
            server.verify()
        }
    }

    private fun verifier(builder: RestClient.Builder): TurnstileVerifier =
        TurnstileVerifier(
            TurnstileProperties(enabled = true, secretKey = "test-secret", expectedHostnames = setOf("zuf.uk", "www.zuf.uk")),
            builder.build()
        )
}
