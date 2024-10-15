package com.zufar.urlshortener.auth.repository

import com.zufar.urlshortener.auth.entity.UserDetails
import org.springframework.data.mongodb.repository.MongoRepository

interface UserRepository : MongoRepository<UserDetails, String> {

    fun findByEmail(email: String): UserDetails?
}
