package com.zufar.urlshortener.auth.service

import com.mongodb.ConnectionString
import com.mongodb.client.MongoClients
import com.zufar.urlshortener.auth.dto.*
import com.zufar.urlshortener.auth.security.*
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.security.AuthenticatedUserIdProvider
import com.zufar.urlshortener.shared.security.PrivacyHasher
import com.zufar.urlshortener.users.dto.ChangePasswordRequest
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.*
import com.zufar.urlshortener.users.service.UserAccountService
import org.bson.Document
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable
import org.mockito.kotlin.*
import org.springframework.beans.factory.support.StaticListableBeanFactory
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.repository.support.MongoRepositoryFactory
import org.springframework.data.repository.core.support.RepositoryComposition.RepositoryFragments
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.JavaMailSenderImpl
import org.springframework.mock.web.*
import org.springframework.security.authentication.ProviderManager
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.core.context.SecurityContextHolder
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.UUID
import java.util.concurrent.Callable
import java.util.concurrent.Executors
import kotlin.test.*

@EnabledIfEnvironmentVariable(named = "URL_SHORTENER_TEST_MONGO_URI", matches = ".+")
class AuthSecurityIntegrationTest {
    private lateinit var mongo: MongoTemplate
    private lateinit var repository: UserAccountRepository
    private lateinit var client: com.mongodb.client.MongoClient
    private val encoder = AccountPasswordEncoder()
    private val now = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MILLIS)
    private val clock = Clock.fixed(now, ZoneOffset.UTC)
    private val jwt = JwtTokenProvider("isolated-auth-test-signing-key-2026-abcdef", 3600000, 604800000, clock)

    @BeforeEach
    fun setup() {
        val connection = ConnectionString(System.getenv("URL_SHORTENER_TEST_MONGO_URI"))
        require(connection.database == null && connection.hosts.all { it.startsWith("127.0.0.1:") })
        client = MongoClients.create(connection)
        mongo = MongoTemplate(client, "shortener_auth_test_${UUID.randomUUID().toString().replace("-", "")}")
        repository = MongoRepositoryFactory(mongo).getRepository(UserAccountRepository::class.java,
            RepositoryFragments.just(UserAccountUpdatesImpl(mongo)))
    }

    @AfterEach
    fun cleanup() { SecurityContextHolder.clearContext(); mongo.db.drop(); client.close() }

    @Test
    fun `all stale account writers fail without restoring credentials on legacy documents`() {
        val old = repository.save(user())
        mongo.getCollection("user_details").updateOne(Document("_id", old.id), Document("\$unset", Document("accountRevision", "")))
        val current = repository.updateAccount(old, old.copy(password = "new hash", tokenVersion = 1))!!
        assertEquals(1L, current.accountRevision)
        val staleWrites = listOf(
            old.copy(firstName = "Profile"), old.copy(passwordResetTokenHash = "new challenge"),
            old.copy(emailVerified = true), old.copy(password = null)
        )
        staleWrites.forEach { assertNull(repository.updateAccount(old, it)) }
        val profile = repository.updateAccount(current, current.copy(firstName = "Updated"))!!
        assertEquals("new hash", profile.password)
        assertEquals(1, profile.tokenVersion)
        assertEquals("Updated", profile.firstName)
    }

    @Test
    fun `concurrent reset completion has exactly one winner`() {
        val token = "x".repeat(43)
        val old = repository.save(user().copy(passwordResetTokenHash = encoder.encode(token),
            passwordResetTokenId = PrivacyHasher.sha256(token)!!.take(16), passwordResetTokenExpiresAt = now.plusSeconds(600)))
        val recovery = PasswordResetService(repository, encoder, clock, mock())
        val pool = Executors.newFixedThreadPool(12)
        try {
            val winners = pool.invokeAll((1..30).map { Callable {
                try { recovery.resetPassword(ResetPasswordRequest(token, "replacement password")); true }
                catch (_: ApplicationException) { false }
            } }).count { it.get() }
            assertEquals(1, winners)
            assertNull(repository.findById(old.id!!).orElseThrow().passwordResetTokenHash)
        } finally { pool.shutdownNow() }
    }

    @Test
    fun `verification attempts are shared across processes and cannot exceed five concurrently`() {
        val pending = repository.save(user().copy(emailVerificationCodeHash = "code", emailVerificationCodeExpiresAt = now.plusSeconds(600)))
        val pool = Executors.newFixedThreadPool(12)
        try {
            val accepted = pool.invokeAll((1..50).map { Callable {
                UserAccountUpdatesImpl(mongo).claimVerificationAttempt(pending.id!!, "code", now, 5) != null
            } }).count { it.get() }
            assertEquals(5, accepted)
            assertNull(repository.claimVerificationAttempt(pending.id!!, "code", now, 5))
            assertEquals(5, repository.findById(pending.id).orElseThrow().emailVerificationAttempts)
        } finally { pool.shutdownNow() }
    }

    @Test
    fun `legacy users missing verification defaults can resend and verify a fresh code`() {
        val legacy = repository.save(user())
        mongo.getCollection("user_details").updateOne(Document("_id", legacy.id),
            Document("\$unset", Document("emailVerified", "").append("accountRevision", "").append("emailVerificationAttempts", "")))
        val notifier: EmailVerificationNotifier = mock()
        whenever(notifier.sendCode(any(), any(), any())).thenReturn("email")
        val flow = EmailVerificationWorkflow(repository, encoder, notifier, true, 10, 60, clock)
        flow.resendVerificationCode(ResendVerificationRequest(legacy.email))
        val code = argumentCaptor<String>()
        verify(notifier).sendCode(eq(legacy.email), code.capture(), eq(10L))
        val verified = flow.verifyEmail(VerifyEmailRequest(legacy.email, code.firstValue))
        assertTrue(verified.emailVerified)
        assertTrue(verified.passwordEmailVerified)
    }

    @Test
    fun `resending a code does not reset an exhausted account attempt window`() {
        val pending = repository.save(user().copy(emailVerificationCodeHash = encoder.encode("123456"),
            emailVerificationCodeExpiresAt = now.plusSeconds(600), emailVerificationCodeSentAt = now.minusSeconds(61),
            emailVerificationAttempts = 5, emailVerificationAttemptsResetAt = now.plusSeconds(600)))
        val notifier: EmailVerificationNotifier = mock()
        whenever(notifier.sendCode(any(), any(), any())).thenReturn("email")
        val flow = EmailVerificationWorkflow(repository, encoder, notifier, true, 10, 60, clock)
        flow.resendVerificationCode(ResendVerificationRequest(pending.email))
        val updated = repository.findById(pending.id!!).orElseThrow()
        assertEquals(5, updated.emailVerificationAttempts)
        assertNull(repository.claimVerificationAttempt(updated.id!!, updated.emailVerificationCodeHash!!, now, 5))
        val later = EmailVerificationWorkflow(repository, encoder, notifier, true, 10, 60,
            Clock.fixed(now.plusSeconds(601), ZoneOffset.UTC))
        later.resendVerificationCode(ResendVerificationRequest(pending.email))
        assertEquals(0, repository.findById(pending.id).orElseThrow().emailVerificationAttempts)
    }

    @Test
    fun `signup verification SMTP reset and login work and revoke both old token types`() {
        TestSmtpServer().use { smtp ->
            val sender = JavaMailSenderImpl().apply { host = "127.0.0.1"; port = smtp.port }
            val beans = StaticListableBeanFactory(mapOf("sender" to sender))
            val provider = beans.getBeanProvider(JavaMailSender::class.java)
            val notifier = EmailVerificationNotifier(provider, "no-reply@example.test")
            val resetNotifier = PasswordResetNotifier(provider, "no-reply@example.test", "https://frontend.example.test/reset-password")
            val details = CustomUserDetailsService(repository)
            val dao = DaoAuthenticationProvider(details).apply { setPasswordEncoder(encoder) }
            val auth = AuthService(ProviderManager(dao), repository, encoder, jwt, notifier, true, 10, 60, clock)
            val recovery = PasswordResetService(repository, encoder, clock, resetNotifier)
            val password = "ж".repeat(40)
            assertTrue(auth.signUp(SignUpRequest("Jane", "Doe", "USA", 30, "jane@example.test", password)).verificationRequired)
            val code = Regex("(?m)^\\d{6}$").find(smtp.receive())!!.value
            val oldTokens = auth.verifyEmail(VerifyEmailRequest("jane@example.test", code))
            assertNotNull(auth.signIn(SignInRequest("jane@example.test", password)).accessToken)
            recovery.requestReset(ForgotPasswordRequest("jane@example.test"))
            val mail = smtp.receive()
            val token = Regex("token=([A-Za-z0-9_-]{43})").find(mail)!!.groupValues[1]
            assertTrue(mail.contains("https://frontend.example.test/reset-password?token="))
            val newPassword = "я".repeat(40)
            recovery.resetPassword(ResetPasswordRequest(token, newPassword))
            assertFailsWith<ApplicationException> { recovery.resetPassword(ResetPasswordRequest(token, password)) }
            assertFailsWith<ApplicationException> { auth.refreshAccessToken(RefreshTokenRequest(oldTokens.refreshToken)) }
            val filter = JwtAuthenticationFilter(details, jwt)
            filter.doFilter(MockHttpServletRequest().apply { addHeader("Authorization", "Bearer ${oldTokens.accessToken}") },
                MockHttpServletResponse(), MockFilterChain())
            assertNull(SecurityContextHolder.getContext().authentication)
            assertFails { auth.signIn(SignInRequest("jane@example.test", password)) }
            assertNotNull(auth.signIn(SignInRequest("jane@example.test", newPassword)).accessToken)
            recovery.requestReset(ForgotPasswordRequest("unknown@example.test"))
            assertFalse(smtp.hasMessage())
        }
    }

    @Test
    fun `password change clears outstanding reset and old sessions while preserving new login`() {
        val old = repository.save(user().copy(password = encoder.encode("old password phrase"), emailVerified = true,
            passwordResetTokenHash = encoder.encode("reset-token"), passwordResetTokenId = "reset-id", passwordResetTokenExpiresAt = now.plusSeconds(600)))
        val details = CustomUserDetailsService(repository)
        val oldAccess = jwt.generateAccessToken(details.loadUserByUsername(old.email))
        val ids: AuthenticatedUserIdProvider = mock()
        whenever(ids.requireAuthenticatedUserId()).thenReturn(old.id)
        UserAccountService(ids, repository, encoder, clock).changePassword(ChangePasswordRequest("old password phrase", "new password phrase"))
        val current = repository.findById(old.id!!).orElseThrow()
        assertTrue(encoder.matches("new password phrase", current.password))
        assertNull(current.passwordResetTokenHash)
        assertNull(current.passwordResetTokenId)
        JwtAuthenticationFilter(details, jwt).doFilter(MockHttpServletRequest().apply { addHeader("Authorization", "Bearer $oldAccess") },
            MockHttpServletResponse(), MockFilterChain())
        assertNull(SecurityContextHolder.getContext().authentication)
        val fresh = jwt.generateAccessToken(details.loadUserByUsername(old.email))
        JwtAuthenticationFilter(details, jwt).doFilter(MockHttpServletRequest().apply { addHeader("Authorization", "Bearer $fresh") },
            MockHttpServletResponse(), MockFilterChain())
        assertNotNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `account-wide logout revokes copied access and refresh credentials and tolerates repeated calls`() {
        val saved = repository.save(user().copy(password = encoder.encode("unique river comet phrase"), emailVerified = true))
        val details = CustomUserDetailsService(repository)
        val auth = AuthService(mock(), repository, encoder, jwt, mock(), true, 10, 60, clock)
        val principal = details.loadUserByUsername(saved.email)
        val access = jwt.generateAccessToken(principal)
        val refresh = jwt.generateRefreshToken(principal)
        auth.logout(LogoutRequest(refresh, access))
        auth.logout(LogoutRequest(refresh, access))
        assertEquals(1, repository.findById(saved.id!!).orElseThrow().tokenVersion)
        assertFailsWith<ApplicationException> { auth.refreshAccessToken(RefreshTokenRequest(refresh)) }
        JwtAuthenticationFilter(details, jwt).doFilter(MockHttpServletRequest().apply { addHeader("Authorization", "Bearer $access") },
            MockHttpServletResponse(), MockFilterChain())
        assertNull(SecurityContextHolder.getContext().authentication)
        assertNotNull(auth.refreshAccessToken(RefreshTokenRequest(jwt.generateRefreshToken(details.loadUserByUsername(saved.email)))).accessToken)
        val newAccess = jwt.generateAccessToken(details.loadUserByUsername(saved.email))
        // A stale but unexpired refresh credential must not mask the current access credential.
        auth.logout(LogoutRequest(refresh, newAccess))
        assertEquals(2, repository.findById(saved.id).orElseThrow().tokenVersion)
    }

    @Test
    fun `logout revokes a final refreshed access token after its refresh token expires`() {
        val saved = repository.save(user().copy(emailVerified = true))
        val details = CustomUserDetailsService(repository)
        val key = "isolated-auth-test-signing-key-2026-abcdef"
        // JWT verification uses the wall clock; create the expired refresh in the past.
        val before = JwtTokenProvider(key, 3600000, 1000, Clock.fixed(now.minusSeconds(3), ZoneOffset.UTC))
        val expiredRefresh = before.generateRefreshToken(details.loadUserByUsername(saved.email))
        val access = jwt.generateAccessToken(details.loadUserByUsername(saved.email))
        assertFalse(jwt.validateRefreshToken(expiredRefresh))
        assertTrue(jwt.validateAccessToken(access))
        val auth = AuthService(mock(), repository, encoder, jwt, mock(), true, 10, 60, clock)
        auth.logout(LogoutRequest(expiredRefresh, access))
        assertEquals(1, repository.findById(saved.id!!).orElseThrow().tokenVersion)
        JwtAuthenticationFilter(details, jwt).doFilter(MockHttpServletRequest().apply { addHeader("Authorization", "Bearer $access") },
            MockHttpServletResponse(), MockFilterChain())
        assertNull(SecurityContextHolder.getContext().authentication)
    }

    @Test
    fun `parallel recovery requests across service instances send one mail and keep the same link`() {
        val saved = repository.save(user())
        val notifier: PasswordResetNotifier = mock()
        val services = List(2) { PasswordResetService(repository, encoder, clock, notifier) }
        val pool = Executors.newFixedThreadPool(8)
        try {
            pool.invokeAll((0..15).map { i -> Callable { services[i % 2].requestReset(ForgotPasswordRequest("  JANE@EXAMPLE.TEST  ")) } })
                .forEach { it.get() }
        } finally { pool.shutdownNow() }
        verify(notifier, times(1)).sendResetLink(eq(saved.email), any(), eq(15L))
        val challenge = repository.findById(saved.id!!).orElseThrow()
        services[0].requestReset(ForgotPasswordRequest(saved.email))
        assertEquals(challenge.passwordResetTokenId, repository.findById(saved.id).orElseThrow().passwordResetTokenId)
        for (i in 1..5) PasswordResetService(repository, encoder,
            Clock.fixed(now.plusSeconds(i * 61L), ZoneOffset.UTC), notifier).requestReset(ForgotPasswordRequest(saved.email))
        verify(notifier, times(5)).sendResetLink(eq(saved.email), any(), eq(15L))
        val fullBudget = repository.findById(saved.id).orElseThrow()
        assertEquals(5, fullBudget.passwordResetMessages)
        PasswordResetService(repository, encoder, Clock.fixed(now.plusSeconds(3601), ZoneOffset.UTC), notifier)
            .requestReset(ForgotPasswordRequest(saved.email))
        verify(notifier, times(6)).sendResetLink(eq(saved.email), any(), eq(15L))
    }

    @Test
    fun `normalized account attempt budget is shared across concurrent service instances and expires`() {
        val saved = repository.save(user())
        val manager: org.springframework.security.authentication.AuthenticationManager = mock()
        whenever(manager.authenticate(any())).thenThrow(org.springframework.security.authentication.BadCredentialsException("invalid"))
        val services = List(2) { AuthService(manager, repository, encoder, jwt, mock(), true, 10, 60, clock) }
        val pool = Executors.newFixedThreadPool(8)
        try {
            pool.invokeAll((0..39).map { i -> Callable { runCatching {
                services[i % 2].signIn(SignInRequest("  JANE@EXAMPLE.TEST  ", "wrong"))
            } } }).forEach { it.get() }
        } finally { pool.shutdownNow() }
        val budget = repository.findById(saved.id!!).orElseThrow()
        assertEquals(10, budget.signInAttempts)
        verify(manager, times(10)).authenticate(any())
        assertEquals("SIGN_IN_THROTTLED", assertFailsWith<ApplicationException> {
            services[0].signIn(SignInRequest(saved.email, "wrong"))
        }.code)
        assertFailsWith<org.springframework.security.authentication.BadCredentialsException> {
            AuthService(manager, repository, encoder, jwt, mock(), true, 10, 60,
                Clock.fixed(now.plusSeconds(901), ZoneOffset.UTC)).signIn(SignInRequest(saved.email, "wrong"))
        }
        assertEquals(1, repository.findById(saved.id).orElseThrow().signInAttempts)
    }

    private fun user() = UserAccountDocument(id = "user-1", firstName = "Jane", lastName = "Doe", email = "jane@example.test", password = "old hash")
}
