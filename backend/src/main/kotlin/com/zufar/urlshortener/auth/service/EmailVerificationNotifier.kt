package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.shared.logging.LogSanitizer
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
    @Value($$"${app.auth.email-verification.mail.from:noreply@shorty.local}") private val fromAddress: String
) {
    private val log = LoggerFactory.getLogger(EmailVerificationNotifier::class.java)

    fun sendCode(email: String, code: String, expiresInMinutes: Long): String {
        val mailSender = mailSenderProvider.getIfAvailable()
        val maskedEmail = LogSanitizer.maskEmail(email)
        val emailDomain = LogSanitizer.emailDomain(email)
        if (mailSender == null) {
            log.warn(
                "email_verification_delivery_fallback deliveryMode={} reason={} maskedEmail={} emailDomain={}",
                LOG_DELIVERY_MODE,
                "mail_sender_unavailable",
                maskedEmail,
                emailDomain
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
            log.info(
                "email_verification_code_sent deliveryMode={} maskedEmail={} emailDomain={}",
                EMAIL_DELIVERY_MODE,
                maskedEmail,
                emailDomain
            )
            EMAIL_DELIVERY_MODE
        } catch (ex: Exception) {
            log.warn(
                "email_verification_delivery_fallback deliveryMode={} reason={} maskedEmail={} emailDomain={}",
                LOG_DELIVERY_MODE,
                ex.javaClass.simpleName,
                maskedEmail,
                emailDomain,
                ex
            )
            LOG_DELIVERY_MODE
        }
    }
}
