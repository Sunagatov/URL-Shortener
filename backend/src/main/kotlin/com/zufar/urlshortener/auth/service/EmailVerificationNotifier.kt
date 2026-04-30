package com.zufar.urlshortener.auth.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.ObjectProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service

private const val EMAIL_DELIVERY_MODE = "email"
private const val LOG_DELIVERY_MODE = "log"

@Service
class EmailVerificationNotifier(
    private val mailSenderProvider: ObjectProvider<JavaMailSender>,
    @Value("\${app.auth.email-verification.mail.from:noreply@shorty.local}") private val fromAddress: String
) {
    private val log = LoggerFactory.getLogger(EmailVerificationNotifier::class.java)

    fun sendCode(email: String, code: String, expiresInMinutes: Long): String {
        val mailSender = mailSenderProvider.getIfAvailable()
        if (mailSender == null) {
            log.warn(
                "auth.email_verification.code_generated: email={}, code={}, delivery_mode={}",
                email,
                code,
                LOG_DELIVERY_MODE
            )
            return LOG_DELIVERY_MODE
        }

        val message = SimpleMailMessage().apply {
            from = fromAddress
            setTo(email)
            subject = "Your Shorty URL verification code"
            text = buildString {
                appendLine("Use this 6-digit code to verify your Shorty URL account:")
                appendLine()
                appendLine(code)
                appendLine()
                append("The code expires in $expiresInMinutes minutes.")
            }
        }
        return try {
            mailSender.send(message)
            log.info("auth.email_verification.code_sent: email={}, delivery_mode={}", email, EMAIL_DELIVERY_MODE)
            EMAIL_DELIVERY_MODE
        } catch (ex: Exception) {
            log.warn(
                "auth.email_verification.delivery_failed_falling_back_to_log: email={}, code={}",
                email,
                code,
                ex
            )
            LOG_DELIVERY_MODE
        }
    }
}
