package com.zufar.urlshortener.auth.service

import com.zufar.urlshortener.shared.logging.LogSanitizer
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.ObjectProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import java.net.URI

@Service
class PasswordResetNotifier(
    private val mailSenderProvider: ObjectProvider<JavaMailSender>,
    @Value($$"${app.auth.email-verification.mail.from:noreply@shorty.local}") private val fromAddress: String,
    @Value($$"${app.auth.password-reset.url:}") private val resetUrl: String
) {
    private val log = LoggerFactory.getLogger(javaClass)

    fun sendResetLink(email: String, token: String, expiresInMinutes: Long) {
        try {
            val uri = URI(resetUrl)
            require(uri.isAbsolute && uri.host != null && uri.userInfo == null && uri.fragment == null && uri.query == null)
            require(uri.scheme == "https" || (uri.scheme == "http" && uri.host in setOf("localhost", "127.0.0.1")))
            val sender = requireNotNull(mailSenderProvider.getIfAvailable()) { "Mail sender is not configured" }
            val link = UriComponentsBuilder.fromUri(uri).queryParam("token", token).build().encode().toUriString()
            sender.send(SimpleMailMessage().apply {
                from = fromAddress
                setTo(email)
                subject = "Reset your Shorty URL password"
                text = "Open this link to choose a new password:\n\n$link\n\nThe link expires in $expiresInMinutes minutes and can be used once. If you did not request it, ignore this email."
            })
            log.info("password_reset_email_sent emailDomain={}", LogSanitizer.emailDomain(email))
        } catch (ex: Exception) {
            // Preserve generic public responses; never log the link or SMTP exception body.
            log.error("password_reset_email_failed emailDomain={} errorType={}", LogSanitizer.emailDomain(email), ex.javaClass.simpleName)
        }
    }
}
