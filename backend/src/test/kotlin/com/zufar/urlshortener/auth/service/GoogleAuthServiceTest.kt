package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.auth.security.JwtTokenProvider
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.users.entity.AuthProvider
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.web.client.RestTemplate
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@ExtendWith(MockitoExtension::class)
class GoogleAuthServiceTest {

    @Mock private lateinit var userAccountRepository: UserAccountRepository
    @Mock private lateinit var jwtTokenProvider: JwtTokenProvider
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    @org.junit.jupiter.api.BeforeEach
    fun defaultAccountUpdates() {
        org.mockito.Mockito.lenient().`when`(userAccountRepository.updateAccount(any(), any())).thenAnswer { it.arguments[1] }
    }

    private fun service(restTemplate: RestTemplate = RestTemplate()) = GoogleAuthService(
        userAccountRepository = userAccountRepository,
        jwtTokenProvider = jwtTokenProvider,
        clientId = "test-client-id",
        clientSecret = "test-client-secret",
        redirectUri = "http://localhost:3000/callback",
        clock = clock
    ).also {
        val field = GoogleAuthService::class.java.getDeclaredField("restTemplate")
        field.isAccessible = true
        field.set(it, restTemplate)
    }

    @Test
    fun `authenticate creates new user from Google profile`() {
        val restTemplate = mockRestTemplate(
            tokenResponse = mapOf("access_token" to "google-access-token"),
            userInfoResponse = mapOf("email" to "user@gmail.com", "sub" to "google-subject", "email_verified" to true, "given_name" to "Jane", "family_name" to "Doe")
        )
        whenever(userAccountRepository.findByEmailIgnoreCase("user@gmail.com")).thenReturn(null)
        whenever(userAccountRepository.save(any<UserAccountDocument>())).thenAnswer { (it.arguments[0] as UserAccountDocument).copy(id = "new-id") }
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("access-token")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh-token")

        val response = service(restTemplate).authenticate("auth-code", "v".repeat(43))

        assertEquals("access-token", response.accessToken)
        val captor = argumentCaptor<UserAccountDocument>()
        val exchange = argumentCaptor<HttpEntity<*>>()
        verify(restTemplate).postForEntity(any<String>(), exchange.capture(), any<Class<*>>())
        assertEquals(listOf("v".repeat(43)), (exchange.firstValue.body as Map<*, *>)["code_verifier"])
        verify(userAccountRepository).save(captor.capture())
        assertEquals(AuthProvider.GOOGLE, captor.firstValue.authProvider)
        assertTrue(captor.firstValue.emailVerified)
        assertEquals("Jane", captor.firstValue.firstName)
    }

    @Test
    fun `authenticate returns existing Google user without creating new one`() {
        val existing = UserAccountDocument(
            id = "existing-id", firstName = "Jane", lastName = "Doe",
            email = "user@gmail.com", authProvider = AuthProvider.GOOGLE, emailVerified = true
        )
        val restTemplate = mockRestTemplate(
            tokenResponse = mapOf("access_token" to "google-access-token"),
            userInfoResponse = mapOf("email" to "user@gmail.com", "sub" to "google-subject", "email_verified" to true, "given_name" to "Jane", "family_name" to "Doe")
        )
        whenever(userAccountRepository.findByEmailIgnoreCase("user@gmail.com")).thenReturn(existing)
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("access-token")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh-token")

        service(restTemplate).authenticate("auth-code", "v".repeat(43))

        verify(userAccountRepository, never()).save(any())
    }

    @Test
    fun `authenticate returns existing LOCAL user when Google proves the same verified email`() {
        val existing = UserAccountDocument(
            id = "local-id", firstName = "Jane", lastName = "Doe",
            email = "user@gmail.com", password = "hashed", authProvider = AuthProvider.LOCAL, emailVerified = true, passwordEmailVerified = true
        )
        val restTemplate = mockRestTemplate(
            tokenResponse = mapOf("access_token" to "google-access-token"),
            userInfoResponse = mapOf("email" to "user@gmail.com", "sub" to "google-subject", "email_verified" to true, "given_name" to "Jane", "family_name" to "Doe")
        )
        whenever(userAccountRepository.findByEmailIgnoreCase("user@gmail.com")).thenReturn(existing)
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("access-token")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh-token")

        val response = service(restTemplate).authenticate("auth-code", "v".repeat(43))

        assertEquals("access-token", response.accessToken)
        verify(userAccountRepository, never()).save(any())
    }

    @Test
    fun `authenticate removes a password planted before email verification`() {
        val existing = UserAccountDocument(
            id = "local-id",
            firstName = "Jane",
            lastName = "Doe",
            email = "user@gmail.com",
            password = "hashed",
            authProvider = AuthProvider.LOCAL,
            emailVerified = false,
            emailVerificationCodeHash = "challenge-hash",
            emailVerificationCodeExpiresAt = Instant.parse("2024-01-01T10:20:30Z"),
            emailVerificationCodeSentAt = Instant.parse("2024-01-01T10:10:30Z")
        )
        val restTemplate = mockRestTemplate(
            tokenResponse = mapOf("access_token" to "google-access-token"),
            userInfoResponse = mapOf("email" to "user@gmail.com", "sub" to "google-subject", "email_verified" to true, "given_name" to "Jane", "family_name" to "Doe")
        )
        whenever(userAccountRepository.findByEmailIgnoreCase("user@gmail.com")).thenReturn(existing)
        whenever(userAccountRepository.updateAccount(any(), any<UserAccountDocument>())).thenAnswer { it.arguments[1] }
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("access-token")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh-token")

        service(restTemplate).authenticate("auth-code", "v".repeat(43))

        val captor = argumentCaptor<UserAccountDocument>()
        verify(userAccountRepository).updateAccount(any(), captor.capture())
        assertEquals(AuthProvider.GOOGLE, captor.firstValue.authProvider)
        kotlin.test.assertNull(captor.firstValue.password)
        assertEquals(existing.tokenVersion + 1, captor.firstValue.tokenVersion)
        assertEquals(true, captor.firstValue.emailVerified)
        assertEquals(Instant.parse("2024-01-01T10:15:30Z"), captor.firstValue.emailVerifiedAt)
        assertEquals(null, captor.firstValue.emailVerificationCodeHash)
        assertEquals(null, captor.firstValue.emailVerificationCodeExpiresAt)
        assertEquals(null, captor.firstValue.emailVerificationCodeSentAt)
    }

    @Test
    fun `Google adoption clears passwords and sessions auto-verified by disabled or legacy verification`() {
        val existing = UserAccountDocument(id = "legacy-local", firstName = "Jane", lastName = "Doe",
            email = "user@gmail.com", password = "attacker-planted-hash", emailVerified = true,
            emailVerifiedAt = Instant.now(clock), tokenVersion = 4,
            passwordResetTokenHash = "old-reset", passwordResetTokenId = "old-id")
        val restTemplate = mockRestTemplate(mapOf("access_token" to "google-token"),
            mapOf("email" to existing.email, "sub" to "google-subject", "email_verified" to true))
        whenever(userAccountRepository.findByEmailIgnoreCase(existing.email)).thenReturn(existing)
        whenever(userAccountRepository.updateAccount(any(), any())).thenAnswer { it.arguments[1] }
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("access")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh")
        service(restTemplate).authenticate("code", "v".repeat(43))
        val changed = argumentCaptor<UserAccountDocument>()
        verify(userAccountRepository).updateAccount(org.mockito.kotlin.eq(existing), changed.capture())
        kotlin.test.assertNull(changed.firstValue.password)
        kotlin.test.assertNull(changed.firstValue.passwordResetTokenHash)
        assertEquals(5, changed.firstValue.tokenVersion)
        assertEquals(AuthProvider.GOOGLE, changed.firstValue.authProvider)
    }

    @Test
    fun `authenticate rejects unverified Google email`() {
        val restTemplate = mockRestTemplate(
            tokenResponse = mapOf("access_token" to "google-access-token"),
            userInfoResponse = mapOf("email" to "user@gmail.com", "email_verified" to false, "given_name" to "Jane", "family_name" to "Doe")
        )

        val ex = assertThrows<ApplicationException> { service(restTemplate).authenticate("auth-code", "v".repeat(43)) }
        assertEquals("GOOGLE_AUTH_FAILED", ex.code)
    }

    @Test
    fun `authenticate fails when token exchange returns no access token`() {
        val restTemplate = mockRestTemplate(
            tokenResponse = mapOf("error" to "invalid_grant"),
            userInfoResponse = emptyMap(),
            stubUserInfo = false
        )

        val ex = assertThrows<ApplicationException> { service(restTemplate).authenticate("bad-code", "v".repeat(43)) }
        assertEquals("GOOGLE_AUTH_FAILED", ex.code)
    }

    @Test
    fun `authenticate fails when userinfo has no email`() {
        val restTemplate = mockRestTemplate(
            tokenResponse = mapOf("access_token" to "google-access-token"),
            userInfoResponse = mapOf("given_name" to "Jane")
        )

        val ex = assertThrows<ApplicationException> { service(restTemplate).authenticate("auth-code", "v".repeat(43)) }
        assertEquals("GOOGLE_AUTH_FAILED", ex.code)
    }

    @Test
    fun `historical third-party email cannot enter or create an account without proof`() {
        val existing = UserAccountDocument(id = "victim", firstName = "Jane", lastName = "Doe",
            email = "owner@third-party.test", password = "victim-hash", emailVerified = true, passwordEmailVerified = true)
        whenever(userAccountRepository.findByEmailIgnoreCase(existing.email)).thenReturn(existing, null)
        repeat(2) {
            val transport = mockRestTemplate(mapOf("access_token" to "google-token"),
                mapOf("sub" to "former-owner", "email" to existing.email, "email_verified" to true))
            assertEquals("GOOGLE_LINK_REQUIRES_PROOF", assertThrows<ApplicationException> {
                service(transport).authenticate("code", "v".repeat(43))
            }.code)
        }
        verify(userAccountRepository, never()).save(any())
        verify(userAccountRepository, never()).updateAccount(any(), any())
        verify(jwtTokenProvider, never()).generateAccessToken(any())
    }

    @Test
    fun `established Google subject remains bound when the provider email changes`() {
        val existing = UserAccountDocument(id = "bound", firstName = "Jane", lastName = "Doe",
            email = "original@example.test", googleSubject = "stable-subject", emailVerified = true)
        whenever(userAccountRepository.findByGoogleSubject("stable-subject")).thenReturn(existing)
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("access")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh")
        val transport = mockRestTemplate(mapOf("access_token" to "google-token"),
            mapOf("sub" to "stable-subject", "email" to "changed@third-party.test", "email_verified" to true))
        assertEquals("access", service(transport).authenticate("code", "v".repeat(43)).accessToken)
        verify(userAccountRepository, never()).findByEmailIgnoreCase(any())
    }

    @Test
    fun `same email cannot rebind a different established subject`() {
        val existing = UserAccountDocument(id = "bound", firstName = "Jane", lastName = "Doe",
            email = "owner@gmail.com", googleSubject = "original-owner", emailVerified = true)
        whenever(userAccountRepository.findByEmailIgnoreCase(existing.email)).thenReturn(existing)
        val transport = mockRestTemplate(mapOf("access_token" to "google-token"),
            mapOf("sub" to "different-owner", "email" to existing.email, "email_verified" to true))
        assertThrows<ApplicationException> { service(transport).authenticate("code", "v".repeat(43)) }
        verify(userAccountRepository, never()).updateAccount(any(), any())
    }

    @Test
    fun `third-party Google identity can be explicitly linked from fresh mailbox-proven local authentication`() {
        val existing = UserAccountDocument(id = "local", firstName = "Jane", lastName = "Doe",
            email = "Owner@Third-Party.Test", password = "proven-local-hash", emailVerified = true,
            passwordEmailVerified = true, tokenVersion = 4)
        whenever(userAccountRepository.findByEmailIgnoreCase(EmailNormalizer.normalize(existing.email))).thenReturn(existing)
        whenever(jwtTokenProvider.isRecentAccessToken("local-proof", 300)).thenReturn(true)
        whenever(jwtTokenProvider.getTokenVersionFromJWT("local-proof")).thenReturn(4)
        whenever(jwtTokenProvider.getUsernameFromJWT("local-proof")).thenReturn(existing.email)
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("access")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh")
        val transport = mockRestTemplate(mapOf("access_token" to "google-token"),
            mapOf("sub" to "stable-owner", "email" to existing.email, "email_verified" to true))
        assertEquals("access", service(transport).authenticate("code", "v".repeat(43), "local-proof").accessToken)
        val changed = argumentCaptor<UserAccountDocument>()
        verify(userAccountRepository).updateAccount(org.mockito.kotlin.eq(existing), changed.capture())
        assertEquals("stable-owner", changed.firstValue.googleSubject)
        assertEquals(existing.password, changed.firstValue.password)
    }

    @Test
    fun `linking refuses old or unproven local sessions`() {
        val existing = UserAccountDocument(id = "local", firstName = "Jane", lastName = "Doe",
            email = "owner@third-party.test", password = "local", emailVerified = true)
        whenever(userAccountRepository.findByEmailIgnoreCase(existing.email)).thenReturn(existing)
        val transport = mockRestTemplate(mapOf("access_token" to "google-token"),
            mapOf("sub" to "stable-owner", "email" to existing.email, "email_verified" to true))
        assertThrows<ApplicationException> { service(transport).authenticate("code", "v".repeat(43), "stale-proof") }
        verify(userAccountRepository, never()).updateAccount(any(), any())
    }

    @Test
    fun `missing provider subject fails before any account lookup`() {
        val transport = mockRestTemplate(mapOf("access_token" to "google-token"),
            mapOf("email" to "owner@gmail.com", "email_verified" to true))
        assertThrows<ApplicationException> { service(transport).authenticate("code", "v".repeat(43)) }
        verify(userAccountRepository, never()).findByEmailIgnoreCase(any())
    }

    @Test
    fun `verified Workspace domain can establish a first binding`() {
        whenever(userAccountRepository.save(any<UserAccountDocument>())).thenAnswer { (it.arguments[0] as UserAccountDocument).copy(id = "workspace") }
        whenever(jwtTokenProvider.generateAccessToken(any())).thenReturn("access")
        whenever(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh")
        val transport = mockRestTemplate(mapOf("access_token" to "google-token"),
            mapOf("sub" to "workspace-subject", "email" to "owner@workspace.test", "hd" to "workspace.test", "email_verified" to true))
        assertEquals("access", service(transport).authenticate("code", "v".repeat(43)).accessToken)
    }

    @Suppress("UNCHECKED_CAST")
    private fun mockRestTemplate(tokenResponse: Map<String, Any>, userInfoResponse: Map<String, Any>, stubUserInfo: Boolean = true): RestTemplate {
        val restTemplate = org.mockito.Mockito.mock(RestTemplate::class.java)
        whenever(restTemplate.postForEntity(any<String>(), any<HttpEntity<*>>(), any<Class<*>>()))
            .thenReturn(ResponseEntity.ok(tokenResponse) as ResponseEntity<Map<*, *>>)
        if (stubUserInfo) {
            whenever(restTemplate.exchange(any<String>(), any<HttpMethod>(), any<HttpEntity<*>>(), any<Class<*>>()))
                .thenReturn(ResponseEntity.ok(userInfoResponse) as ResponseEntity<Map<*, *>>)
        }
        return restTemplate
    }
}
