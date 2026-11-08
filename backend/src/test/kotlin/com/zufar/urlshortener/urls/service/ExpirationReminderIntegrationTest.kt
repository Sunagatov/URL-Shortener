package com.zufar.urlshortener.urls.service

import com.mongodb.ConnectionString
import com.mongodb.client.MongoClients
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.users.entity.UserAccountDocument
import com.zufar.urlshortener.users.repository.UserAccountRepository
import com.zufar.urlshortener.users.repository.UserAccountUpdatesImpl
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable
import org.mockito.kotlin.*
import org.springframework.beans.factory.support.StaticListableBeanFactory
import org.springframework.context.annotation.AnnotationConfigApplicationContext
import org.springframework.context.annotation.Configuration
import org.springframework.core.env.MapPropertySource
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.repository.support.MongoRepositoryFactory
import org.springframework.data.repository.core.support.RepositoryComposition.RepositoryFragments
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.MailSendException
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.scheduling.annotation.EnableScheduling
import java.time.*
import java.util.UUID
import java.util.concurrent.*
import kotlin.test.*

@EnabledIfEnvironmentVariable(named = "URL_SHORTENER_TEST_MONGO_URI", matches = ".+")
class ExpirationReminderIntegrationTest {
    private lateinit var client: com.mongodb.client.MongoClient
    private lateinit var mongo: MongoTemplate
    private lateinit var users: UserAccountRepository
    private lateinit var owner: UserAccountDocument
    private lateinit var policy: ExpirationReminderPolicy
    private lateinit var sender: JavaMailSender
    private val clock = ReminderClock(Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MILLIS))
    private val now get() = clock.instant()

    @BeforeEach
    fun setup() {
        val uri = ConnectionString(System.getenv("URL_SHORTENER_TEST_MONGO_URI"))
        require(uri.database == null && uri.hosts.all { it.startsWith("127.0.0.1:") })
        client = MongoClients.create(uri)
        mongo = MongoTemplate(client, "reminder_test_" + UUID.randomUUID().toString().replace("-", ""))
        users = MongoRepositoryFactory(mongo).getRepository(UserAccountRepository::class.java,
            RepositoryFragments.just(UserAccountUpdatesImpl(mongo)))
        owner = users.save(UserAccountDocument(firstName = "Test", lastName = "Owner",
            email = "owner@example.test", emailVerified = true, passwordEmailVerified = true))
        policy = ExpirationReminderPolicy(users, true)
        sender = mock()
    }

    @AfterEach
    fun cleanup() { mongo.db.drop(); client.close() }

    private fun scheduler(enabled: Boolean = true, accountLimit: Long = 5) = ExpirationReminderScheduler(
        mongo, policy, MongoUrlQuotaStore(mongo),
        StaticListableBeanFactory(mapOf("sender" to sender)).getBeanProvider(JavaMailSender::class.java),
        clock, "noreply@example.test", enabled, 100, accountLimit)

    private fun mapping(id: String = "test-link") = UrlMapping(
        urlHash = id, shortUrl = "https://short.example.test/$id", originalUrl = "https://example.com",
        createdAt = now.minusSeconds(86400), expirationDate = now.plusSeconds(3600),
        requestIp = null, userAgent = null, userId = owner.id, expirationReminderEnabled = true)

    @Configuration
    @EnableScheduling
    open class Scheduling

    @Test
    fun `real scheduled callback sends a due opted-in reminder without a manual trigger`() {
        mongo.insert(mapping())
        val sent = CountDownLatch(1)
        doAnswer { sent.countDown(); null }.whenever(sender).send(any<SimpleMailMessage>())
        AnnotationConfigApplicationContext().use { context ->
            context.environment.propertySources.addFirst(MapPropertySource("reminder-test",
                mapOf("app.urls.expiration-reminders.poll-interval-ms" to "50",
                    "app.urls.expiration-reminders.enabled" to "true")))
            context.register(Scheduling::class.java)
            context.registerBean("reminder", ExpirationReminderScheduler::class.java,
                java.util.function.Supplier { scheduler() })
            context.refresh()
            assertEquals(1, context.getBean(
                org.springframework.scheduling.annotation.ScheduledAnnotationBeanPostProcessor::class.java
            ).scheduledTasks.size, "Scheduled method was not registered")
            assertTrue(sent.await(10, TimeUnit.SECONDS), "No natural scheduled callback")
            val deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(3)
            while (mongo.findById("test-link", UrlMapping::class.java)?.expirationReminderSentAt == null
                && System.nanoTime() < deadline) Thread.sleep(10)
            assertNotNull(mongo.findById("test-link", UrlMapping::class.java)?.expirationReminderSentAt)
        }
        val message = argumentCaptor<SimpleMailMessage>()
        verify(sender).send(message.capture())
        assertContentEquals(arrayOf(owner.email), message.firstValue.to)
        assertFalse(message.firstValue.text!!.contains("https://example.com"), "Do not disclose the destination")
    }

    @Test
    fun `concurrent scheduler workers claim a reminder only once`() {
        mongo.insert(mapping())
        val pool = Executors.newFixedThreadPool(8)
        try { pool.invokeAll((1..12).map { Callable { scheduler().sendDueReminders() } }).forEach { it.get() } }
        finally { pool.shutdownNow() }
        verify(sender, times(1)).send(any<SimpleMailMessage>())
        assertEquals(1, mongo.findById("test-link", UrlMapping::class.java)!!.expirationReminderAttempts)
    }

    @Test
    fun `historical opt-out expired disabled and distant links do not send`() {
        mongo.insert(mapping("historical").copy(expirationReminderEnabled = false))
        mongo.insert(mapping("expired").copy(expirationDate = now.minusSeconds(1)))
        mongo.insert(mapping("disabled").copy(disabled = true))
        mongo.insert(mapping("later").copy(expirationDate = now.plusSeconds(90000)))
        scheduler().sendDueReminders()
        verifyNoInteractions(sender)
    }

    @Test
    fun `an unproven legacy mailbox cannot receive or opt into a reminder`() {
        users.save(owner.copy(passwordEmailVerified = false))
        assertFailsWith<com.zufar.urlshortener.shared.exception.ApplicationException> {
            policy.requireVerifiedOwner(owner.id)
        }
        mongo.insert(mapping())
        scheduler().sendDueReminders()
        verifyNoInteractions(sender)
        assertFalse(mongo.findById("test-link", UrlMapping::class.java)!!.expirationReminderEnabled)
    }

    @Test
    fun `account mail allowance defers rather than flooding or resetting history`() {
        mongo.insert(mapping("first"))
        mongo.insert(mapping("second"))
        scheduler(accountLimit = 1).sendDueReminders()
        verify(sender, times(1)).send(any<SimpleMailMessage>())
        val pending = mongo.findAll(UrlMapping::class.java).single { it.expirationReminderSentAt == null }
        assertNotNull(pending.expirationReminderNextAttemptAt)
        assertEquals(0, pending.expirationReminderAttempts)
        scheduler(accountLimit = 1).sendDueReminders()
        verifyNoMoreInteractions(sender)
    }

    @Test
    fun `SMTP failures retry with a delay and stop after three attempts`() {
        mongo.insert(mapping())
        doThrow(MailSendException("private provider details")).whenever(sender).send(any<SimpleMailMessage>())
        repeat(4) {
            scheduler().sendDueReminders()
            clock.current = clock.current.plusSeconds(301)
        }
        verify(sender, times(3)).send(any<SimpleMailMessage>())
        assertNull(mongo.findById("test-link", UrlMapping::class.java)!!.expirationReminderSentAt)
        assertEquals(3, mongo.findById("test-link", UrlMapping::class.java)!!.expirationReminderAttempts)
    }

    @Test
    fun `feature disabled does not claim or deliver`() {
        mongo.insert(mapping())
        scheduler(enabled = false).sendDueReminders()
        verifyNoInteractions(sender)
        assertEquals(0, mongo.findById("test-link", UrlMapping::class.java)!!.expirationReminderAttempts)
    }
}

private class ReminderClock(var current: Instant) : Clock() {
    override fun getZone(): ZoneId = ZoneOffset.UTC
    override fun withZone(zone: ZoneId): Clock = this
    override fun instant(): Instant = current
}
