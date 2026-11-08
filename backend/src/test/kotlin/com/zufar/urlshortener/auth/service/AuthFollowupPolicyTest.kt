package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.dto.*
import com.zufar.urlshortener.auth.security.*
import com.zufar.urlshortener.shared.security.PasswordPolicy
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import jakarta.validation.Validation
import org.junit.jupiter.api.Test
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSenderImpl
import org.springframework.security.core.userdetails.User
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.Properties
import kotlin.test.*

class AuthFollowupPolicyTest {
    @Test
    fun `all new-password boundaries count Unicode code points after NFC and reject common passwords`() {
        Validation.buildDefaultValidatorFactory().use { factory ->
            val validator = factory.validator
            for (password in listOf("😀".repeat(8), "passwordpassword", "passwordpassword123!", "\uD800".repeat(15), "a".repeat(65))) {
                val requests = listOf(SignUpRequest("Jane", "Doe", "USA", 30, "jane@example.test", password),
                    ResetPasswordRequest("synthetic-token", password), ChangePasswordRequest("old", password))
                requests.forEach { assertTrue(validator.validate(it).isNotEmpty(), "$password was accepted by ${it.javaClass.simpleName}") }
            }
            for (password in listOf("😀".repeat(64), "e\u0301".repeat(64), "long unique comet river phrase")) {
                assertTrue(validator.validate(ResetPasswordRequest("token", password)).isEmpty())
            }
        }
        assertFails { PasswordPolicy.requireAcceptable("longaccountnamelongaccountname", "longaccountname@example.test") }
        assertNull(PasswordPolicy.error("90817263549810276354"))
    }

    @Test
    fun `NFC migration preserves raw legacy bcrypt and argon hashes and canonicalizes only new hashes`() {
        val raw = "e\u0301".repeat(15)
        val composed = "é".repeat(15)
        val encoder = AccountPasswordEncoder()
        val legacy = listOf(BCryptPasswordEncoder().encode(raw)!!,
            "{argon2id}" + Argon2PasswordEncoder(16, 32, 1, 19456, 2).encode(raw))
        for (hash in legacy) {
            assertTrue(encoder.matches(raw, hash))
            assertFalse(encoder.matches(composed, hash))
            assertTrue(encoder.upgradeEncoding(hash))
        }
        val upgraded = encoder.encode(raw)
        assertTrue(encoder.matches(raw, upgraded))
        assertTrue(encoder.matches(composed, upgraded))
        assertFalse(encoder.upgradeEncoding(upgraded))
    }

    @Test
    fun `refresh cannot turn an old authentication into recent account-linking proof`() {
        val now = Instant.now()
        val user = User("jane@example.test", "", emptyList()).withTokenVersion(3, "jane", true)
        val key = "isolated-followup-test-signing-secret-2026"
        val old = JwtTokenProvider(key, 3600000, 604800000, Clock.fixed(now.minusSeconds(600), ZoneOffset.UTC))
        val current = JwtTokenProvider(key, 3600000, 604800000, Clock.fixed(now, ZoneOffset.UTC))
        val refresh = old.generateRefreshToken(user)
        val refreshed = current.generateRefreshedAccessToken(user, refresh)
        assertTrue(current.validateAccessToken(refreshed))
        assertFalse(current.isRecentAccessToken(refreshed, 300))
        assertTrue(current.isRecentAccessToken(current.generateAccessToken(user), 300))
    }

    @Test
    fun `configured mail transport refuses a peer without STARTTLS before sending a message`() {
        val properties = Properties().apply { java.nio.file.Files.newInputStream(java.nio.file.Path.of("src/main/resources/application.properties")).use(::load) }
        assertEquals("\${MAIL_SMTP_STARTTLS_REQUIRED:true}", properties.getProperty("spring.mail.properties.mail.smtp.starttls.required"))
        TestSmtpServer().use { smtp ->
            val sender = JavaMailSenderImpl().apply {
                host = "127.0.0.1"; port = smtp.port
                javaMailProperties["mail.smtp.starttls.enable"] = "true"
                javaMailProperties["mail.smtp.starttls.required"] = "true"
                javaMailProperties["mail.smtp.connectiontimeout"] = "2000"
                javaMailProperties["mail.smtp.timeout"] = "2000"
            }
            assertFails { sender.send(SimpleMailMessage().apply {
                setFrom("test@example.test"); setTo("sink@example.test"); subject = "Synthetic test"; text = "synthetic-reset-link"
            }) }
            assertFalse(smtp.hasMessage())
        }
    }
}
