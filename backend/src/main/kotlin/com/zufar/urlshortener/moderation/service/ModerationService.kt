package com.zufar.urlshortener.moderation.service

import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import com.zufar.urlshortener.moderation.config.ModerationProperties
import com.zufar.urlshortener.moderation.dto.AbuseReportRequest
import com.zufar.urlshortener.moderation.dto.AbuseReportResponse
import com.zufar.urlshortener.moderation.dto.DisableUrlMappingRequest
import com.zufar.urlshortener.moderation.entity.AbuseReport
import com.zufar.urlshortener.moderation.repository.AbuseReportRepository
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.security.AuditLogService
import com.zufar.urlshortener.shared.security.PrivacyHasher
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.repository.UrlRepository
import com.zufar.urlshortener.urls.service.UrlMappingAccessService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Service
import java.net.URI
import java.time.Clock
import java.time.Instant

private const val URL_NOT_FOUND_CODE = "URL_NOT_FOUND"
private const val MODERATION_FORBIDDEN_CODE = "MODERATION_FORBIDDEN"
private const val INVALID_ABUSE_REPORT_CODE = "INVALID_ABUSE_REPORT"

@Service
class ModerationService(
    private val abuseReportRepository: AbuseReportRepository,
    private val urlRepository: UrlRepository,
    private val urlMappingAccessService: UrlMappingAccessService,
    private val authenticatedUserContext: AuthenticatedUserContextService,
    private val clientIpResolver: ClientIpResolver,
    private val moderationProperties: ModerationProperties,
    private val auditLogService: AuditLogService,
    private val clock: Clock
) {
    fun reportAbuse(request: AbuseReportRequest, httpRequest: HttpServletRequest): AbuseReportResponse {
        val urlHash = extractUrlHash(request.shortUrlOrHash)
        if (urlRepository.findByUrlHash(urlHash).isEmpty) {
            throw ApplicationException.notFound(URL_NOT_FOUND_CODE, "URL mapping not found")
        }

        val report = abuseReportRepository.save(
            AbuseReport(
                urlHash = urlHash,
                reason = request.reason?.trim()?.takeIf(String::isNotEmpty),
                reporterIpHash = PrivacyHasher.sha256(clientIpResolver.resolve(httpRequest)),
                reporterUserAgentHash = PrivacyHasher.sha256(httpRequest.getHeader("User-Agent")),
                createdAt = Instant.now(clock)
            )
        )
        auditLogService.record("abuse_report_created", "success", targetId = urlHash, reason = report.reason)
        return AbuseReportResponse(report.id, urlHash)
    }

    fun disableUrlMapping(urlHash: String, request: DisableUrlMappingRequest): UrlMappingDto {
        val actorUserId = authenticatedUserContext.requireAuthenticatedUserId()
        requireModerator(actorUserId)

        val mapping = urlRepository.findByUrlHash(urlHash)
            .orElseThrow { ApplicationException.notFound(URL_NOT_FOUND_CODE, "URL mapping not found") }
        val disabled = urlRepository.save(
            mapping.copy(
                disabled = true,
                disabledReason = request.reason.trim(),
                disabledAt = Instant.now(clock)
            )
        )
        urlMappingAccessService.evictUrlMapping(urlHash)
        auditLogService.record(
            "short_url_disabled",
            "success",
            actorUserId,
            urlHash,
            mapping.originalUrl,
            request.reason
        )
        return UrlMappingDto.fromEntity(disabled)
    }

    private fun requireModerator(userId: String) {
        if (userId !in moderationProperties.adminUserIdSet()) {
            auditLogService.record("moderation_access_denied", "blocked", userId)
            throw ApplicationException.forbidden(MODERATION_FORBIDDEN_CODE, "You are not allowed to perform moderation actions")
        }
    }

    private fun extractUrlHash(value: String): String {
        val trimmed = value.trim().trimEnd('/')
        val candidate = runCatching { URI(trimmed).path.substringAfterLast("/") }
            .getOrDefault(trimmed)
            .substringBefore("?")
            .substringBefore("#")

        if (!candidate.matches(Regex("^[a-zA-Z0-9_-]{3,30}$"))) {
            throw ApplicationException.badRequest(INVALID_ABUSE_REPORT_CODE, "Invalid short URL or hash")
        }
        return candidate
    }
}
