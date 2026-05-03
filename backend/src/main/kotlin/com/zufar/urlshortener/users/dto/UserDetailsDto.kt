package com.zufar.urlshortener.users.dto

import java.time.Instant

data class UserDetailsDto(

    val firstName: String,

    val lastName: String,

    val email: String,

    val country: String?,

    val age: Int?,

    val authProvider: String? = null,

    val createdAt: Instant?
)
