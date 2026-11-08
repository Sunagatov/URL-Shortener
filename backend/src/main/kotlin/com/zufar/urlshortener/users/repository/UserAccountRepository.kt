package com.zufar.urlshortener.users.repository

import com.zufar.urlshortener.users.entity.UserAccountDocument
import org.springframework.data.mongodb.repository.MongoRepository

interface UserAccountRepository : MongoRepository<UserAccountDocument, String>, UserAccountUpdates {
    fun findByEmailIgnoreCase(email: String): UserAccountDocument?
    fun findByGoogleSubject(googleSubject: String): UserAccountDocument?
    fun findByPasswordResetTokenId(tokenId: String): UserAccountDocument?
}
