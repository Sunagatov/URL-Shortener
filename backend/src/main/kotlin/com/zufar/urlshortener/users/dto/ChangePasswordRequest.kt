package com.zufar.urlshortener.users.dto


data class ChangePasswordRequest(

    val currentPassword: String = "",

    val newPassword: String = ""
)
