package com.zufar.urlshortener.shorten.service

import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service

@Service
class EmailNotificationService(
    private val mailSender: JavaMailSender
) {
    fun sendExpirationNotification(email: String, shortUrl: String, expirationDate: String) {
        val message = mailSender.createMimeMessage()
        val helper = MimeMessageHelper(message, true)

        helper.setTo(email)
        helper.setSubject("Your Short URL is Expiring Soon")
        helper.setText(
            """
            Hello,
            
            This is a reminder that your short URL ($shortUrl) will expire on $expirationDate.
            Please consider extending its validity if necessary.
            
            Best regards,
            URL Shortener Team
            """.trimIndent(),
            false
        )

        mailSender.send(message)
    }
}