package com.zufar.urlshortener.auth.dto


data class SignUpRequest(

    val firstName: String = "",

    val lastName: String = "",

    val country: String = "",

    val age: Int = 0,

    val email: String = "",

    val password: String = ""
)
