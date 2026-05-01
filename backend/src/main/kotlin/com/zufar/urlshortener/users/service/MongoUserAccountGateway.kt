package com.zufar.urlshortener.users.service

import com.zufar.urlshortener.users.api.UserAccountRecord
import com.zufar.urlshortener.users.api.UserAccountReader
import com.zufar.urlshortener.users.api.UserCredentialsReader
import com.zufar.urlshortener.users.api.UserPasswordUpdater
import com.zufar.urlshortener.users.api.UserRegistrationWriter
import com.zufar.urlshortener.users.mapper.toDocument
import com.zufar.urlshortener.users.mapper.toRecord
import com.zufar.urlshortener.users.repository.UserAccountRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class MongoUserAccountGateway(
    private val userAccountRepository: UserAccountRepository
) : UserCredentialsReader, UserRegistrationWriter, UserAccountReader, UserPasswordUpdater {

    override fun findByEmailIgnoreCase(email: String): UserAccountRecord? =
        userAccountRepository.findByEmailIgnoreCase(email)?.toRecord()

    override fun save(userAccount: UserAccountRecord): UserAccountRecord =
        userAccountRepository.save(userAccount.toDocument()).toRecord()

    override fun updatePassword(userId: String, encodedPassword: String, newTokenVersion: Int, updatedAt: LocalDateTime) {
        val currentRecord = userAccountRepository.findById(userId).orElseThrow()
        userAccountRepository.save(
            currentRecord.copy(
                password = encodedPassword,
                tokenVersion = newTokenVersion,
                updatedAt = updatedAt
            )
        )
    }
}
