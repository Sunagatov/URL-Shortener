package com.zufar.urlshortener.auth.entity

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.LocalDateTime

@Document(collection = "users")
data class UserDetails(

    @Id
    val id: String? = null,
    val firstName: String,
    val lastName: String,
    val password: String,
    val country: String,
    val age: Int,
    val email: String,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null,
    val lastLogin: LocalDateTime? = null
)
