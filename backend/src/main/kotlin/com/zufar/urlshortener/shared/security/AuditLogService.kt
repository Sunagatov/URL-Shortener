package com.zufar.urlshortener.shared.security

import com.zufar.urlshortener.shared.logging.LogSanitizer
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class AuditLogService {
    private val log = LoggerFactory.getLogger("security.audit")

    fun record(
        action: String,
        outcome: String,
        actorUserId: String? = null,
        targetId: String? = null,
        targetUrl: String? = null,
        reason: String? = null
    ) {
        val safeReason = reason
            ?.take(120)
            ?.let(LogSanitizer::safeLogValue)
            ?.takeUnless { it == "unknown" }
            ?: "-"

        log.info(
            "audit_event action={} outcome={} actorUserId={} targetId={} targetHost={} reason={}",
            action,
            outcome,
            actorUserId ?: "anonymous",
            targetId ?: "-",
            LogSanitizer.safeUrlHost(targetUrl),
            safeReason
        )
    }
}
