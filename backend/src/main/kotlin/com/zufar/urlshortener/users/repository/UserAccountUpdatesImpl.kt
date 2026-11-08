package com.zufar.urlshortener.users.repository

import com.zufar.urlshortener.users.entity.UserAccountDocument
import org.bson.Document
import org.springframework.data.mongodb.core.FindAndModifyOptions
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import java.time.Instant

/** Field-scoped compare-and-set for every existing-account writer, including legacy documents. */
class UserAccountUpdatesImpl(private val mongo: MongoTemplate) : UserAccountUpdates {
    override fun updateAccount(expected: UserAccountDocument, updated: UserAccountDocument): UserAccountDocument? {
        require(expected.id != null && expected.id == updated.id && expected.email == updated.email)
        val before = Document().also { mongo.converter.write(expected, it) }
        val after = Document().also { mongo.converter.write(updated, it) }
        val update = Update().inc("accountRevision", 1L)
        for (field in (before.keys + after.keys) - setOf("_id", "_class", "email", "createdAt", "accountRevision")) {
            if (before[field] != after[field]) {
                if (after.containsKey(field)) update.set(field, after[field]) else update.unset(field)
            }
        }
        val revision = if (expected.accountRevision == 0L) Criteria().orOperator(
            Criteria.where("accountRevision").`is`(0L), Criteria.where("accountRevision").exists(false)
        ) else Criteria.where("accountRevision").`is`(expected.accountRevision)
        return mongo.findAndModify(
            Query(Criteria.where("id").`is`(expected.id).andOperator(revision)), update,
            FindAndModifyOptions.options().returnNew(true), UserAccountDocument::class.java
        )
    }

    override fun claimVerificationAttempt(id: String, challengeHash: String, now: Instant, limit: Int): UserAccountDocument? =
        mongo.findAndModify(
            Query(Criteria.where("id").`is`(id)
                .and("emailVerificationCodeHash").`is`(challengeHash)
                .and("emailVerificationCodeExpiresAt").gt(now)
                .andOperator(
                    Criteria().orOperator(Criteria.where("emailVerified").`is`(false), Criteria.where("emailVerified").exists(false)),
                    Criteria().orOperator(Criteria.where("emailVerificationAttempts").lt(limit), Criteria.where("emailVerificationAttempts").exists(false))
                )),
            Update().inc("emailVerificationAttempts", 1).inc("accountRevision", 1L),
            FindAndModifyOptions.options().returnNew(true), UserAccountDocument::class.java
        )
}
