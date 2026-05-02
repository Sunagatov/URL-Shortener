package com.zufar.urlshortener.users.dto

import java.time.LocalDateTime

data class UserDetailsDto(

    val firstName: String,

    val lastName: String,

    val email: String,

    val country: String?,

    val age: Int?,

    val createdAt: LocalDateTime?
)
