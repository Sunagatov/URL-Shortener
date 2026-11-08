package com.zufar.urlshortener.urls.service

import com.zufar.urlshortener.urls.entity.UrlMapping
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.ObjectProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.data.domain.Sort
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
class ExpirationReminderScheduler(
    private val mongo: MongoTemplate,
    private val recipients: ExpirationReminderPolicy,
    private val quotas: MongoUrlQuotaStore,
    private val mail: ObjectProvider<JavaMailSender>,
    private val clock: Clock,
    @Value("\${app.auth.email-verification.mail.from:noreply@shorty.local}") private val from: String,
    @Value("\${app.urls.expiration-reminders.enabled:false}") private val enabled: Boolean,
    @Value("\${app.urls.expiration-reminders.daily-limit:100}") private val dailyLimit: Long,
    @Value("\${app.urls.expiration-reminders.account-daily-limit:5}") private val accountDailyLimit: Long
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(fixedDelayString = "\${app.urls.expiration-reminders.poll-interval-ms:60000}")
    fun sendDueReminders() {
        if (!enabled) return
        repeat(20) {
            val now = clock.instant()
            val lease = UUID.randomUUID().toString()
            val due = Query(Criteria().andOperator(
                Criteria.where("expirationReminderEnabled").`is`(true),
                Criteria.where("expirationReminderSentAt").`is`(null),
                Criteria.where("disabled").ne(true),
                Criteria.where("expirationDate").gt(now).lte(now.plus(1, ChronoUnit.DAYS)),
                Criteria().orOperator(Criteria.where("expirationReminderAttempts").exists(false),
                    Criteria.where("expirationReminderAttempts").lt(3)),
                Criteria().orOperator(Criteria.where("expirationReminderLeaseUntil").`is`(null),
                    Criteria.where("expirationReminderLeaseUntil").lte(now)),
                Criteria().orOperator(Criteria.where("expirationReminderNextAttemptAt").`is`(null),
                    Criteria.where("expirationReminderNextAttemptAt").lte(now))
            )).with(Sort.by(Sort.Direction.ASC, "expirationDate")).limit(1)
            val mapping = try {
                mongo.findAndModify(due, Update().set("expirationReminderLease", lease)
                    .set("expirationReminderLeaseUntil", now.plusSeconds(300)),
                    FindAndModifyOptions.options().returnNew(true), UrlMapping::class.java)
            } catch (ex: Exception) {
                log.warn("expiration_reminder_claim_failed errorType={}", ex.javaClass.simpleName)
                return
            } ?: return
            val ownedLease = Query(Criteria.where("_id").`is`(mapping.urlHash)
                .and("expirationReminderLease").`is`(lease))
            try {
                val owner = recipients.recipient(mapping.userId)
                if (owner == null) {
                    mongo.updateFirst(ownedLease, releaseLease().set("expirationReminderEnabled", false),
                        UrlMapping::class.java)
                } else if (!quotas.tryReserve("mail:expiration:account:${owner.id}", accountDailyLimit, now)
                    || !quotas.tryReserve("mail:expiration:global", dailyLimit, now)) {
                    mongo.updateFirst(ownedLease, releaseLease()
                        .set("expirationReminderNextAttemptAt", now.plusSeconds(3600)), UrlMapping::class.java)
                } else {
                    // Reserve the attempt before SMTP. A lease prevents concurrent workers sending together.
                    if (mongo.updateFirst(ownedLease, Update().inc("expirationReminderAttempts", 1),
                            UrlMapping::class.java).modifiedCount != 1L) return@repeat
                    val sender = requireNotNull(mail.getIfAvailable()) { "Mail is not configured" }
                    sender.send(SimpleMailMessage().apply {
                        from = this@ExpirationReminderScheduler.from
                        setTo(owner.email)
                        subject = "Your Shorty URL link expires soon"
                        text = "A short link you asked us to remind you about expires at ${mapping.expirationDate} (UTC).\n\n" +
                            "${mapping.shortUrl}\n\nYou can manage or delete the link in My URLs to cancel a pending reminder."
                    })
                    mongo.updateFirst(ownedLease, releaseLease().set("expirationReminderSentAt", clock.instant()),
                        UrlMapping::class.java)
                    log.info("expiration_reminder_sent urlHash={}", mapping.urlHash)
                }
            } catch (ex: Exception) {
                // Never log addresses, destinations, SMTP exception text or configuration.
                log.warn("expiration_reminder_failed urlHash={} errorType={}", mapping.urlHash, ex.javaClass.simpleName)
                try {
                    mongo.updateFirst(ownedLease, releaseLease()
                        .set("expirationReminderNextAttemptAt", clock.instant().plusSeconds(300)), UrlMapping::class.java)
                } catch (_: Exception) { /* The lease expires without resetting the persisted attempt counter. */ }
            }
        }
    }

    private fun releaseLease() = Update().unset("expirationReminderLease").unset("expirationReminderLeaseUntil")
}
