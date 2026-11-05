package com.zufar.urlshortener.moderation.service

import com.zufar.urlshortener.moderation.config.ModerationProperties
import com.zufar.urlshortener.moderation.dto.AbuseReportRequest
import com.zufar.urlshortener.moderation.dto.AbuseReportResponse
import com.zufar.urlshortener.moderation.dto.DisableUrlMappingRequest
import com.zufar.urlshortener.moderation.entity.AbuseReport
import com.zufar.urlshortener.moderation.repository.AbuseReportRepository
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.security.AuditLogService
import com.zufar.urlshortener.shared.security.AuthenticatedUserIdProvider
import com.zufar.urlshortener.shared.security.PrivacyHasher
import com.zufar.urlshortener.urls.api.UrlHashFormat
import com.zufar.urlshortener.urls.dto.UrlMappingDto
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.repository.UrlRepository
import com.zufar.urlshortener.urls.service.UrlMappingAccessService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Service
import org.springframework.dao.DuplicateKeyException
import java.net.URI
import java.time.Clock
import java.time.Instant
import java.time.temporal.ChronoUnit

private const val URL_NOT_FOUND_CODE = "URL_NOT_FOUND"
private const val MODERATION_FORBIDDEN_CODE = "MODERATION_FORBIDDEN"
private const val INVALID_ABUSE_REPORT_CODE = "INVALID_ABUSE_REPORT"
private val URL_HASH_REGEX = Regex("^(${UrlHashFormat.COMBINED_REGEX})$")

@Service
class ModerationService(
    private val abuseReportRepository: AbuseReportRepository,
    private val urlRepository: UrlRepository,
    private val urlMappingAccessService: UrlMappingAccessService,
    private val authenticatedUserIdProvider: AuthenticatedUserIdProvider,
    private val clientIpResolver: ClientIpResolver,
    private val moderationProperties: ModerationProperties,
    private val auditLogService: AuditLogService,
    private val clock: Clock
) {
    fun reportAbuse(request: AbuseReportRequest, httpRequest: HttpServletRequest): AbuseReportResponse {
        val urlHash = extractUrlHash(request.shortUrlOrHash)
        val mapping = urlRepository.findByUrlHash(urlHash)
            .orElseThrow { ApplicationException.notFound(URL_NOT_FOUND_CODE, "URL mapping not found") }

        val reporterIpHash = PrivacyHasher.sha256(clientIpResolver.resolve(httpRequest))
        val reportId = PrivacyHasher.sha256("$urlHash:$reporterIpHash")!!
        val report = try {
            abuseReportRepository.insert(AbuseReport(
                id = reportId,
                urlHash = urlHash,
                reason = request.reason?.trim()?.takeIf(String::isNotEmpty),
                reporterIpHash = reporterIpHash,
                reporterUserAgentHash = PrivacyHasher.sha256(httpRequest.getHeader("User-Agent")),
                createdAt = Instant.now(clock)
            ))
        } catch (_: DuplicateKeyException) {
            // A reporter has one vote per link, including simultaneous requests.
            return AbuseReportResponse(reportId, urlHash)
        }
        applyReportAutoAction(urlHash, mapping)
        auditLogService.record("abuse_report_created", "success", targetId = urlHash, reason = report.reason)
        return AbuseReportResponse(report.id, urlHash)
    }

    fun disableUrlMapping(urlHash: String, request: DisableUrlMappingRequest): UrlMappingDto {
        val actorUserId = authenticatedUserIdProvider.requireAuthenticatedUserId()
        requireModerator(actorUserId)
        val normalizedUrlHash = normalizeUrlHash(urlHash)
        val reason = request.reason.trim()

        val mapping = urlRepository.findByUrlHash(normalizedUrlHash)
            .orElseThrow { ApplicationException.notFound(URL_NOT_FOUND_CODE, "URL mapping not found") }
        val disabled = urlRepository.save(
            mapping.copy(
                disabled = true,
                disabledReason = reason,
                disabledAt = Instant.now(clock)
            )
        )
        urlMappingAccessService.evictUrlMapping(normalizedUrlHash)
        auditLogService.record(
            "short_url_disabled",
            "success",
            actorUserId,
            normalizedUrlHash,
            mapping.originalUrl,
            reason
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

        return normalizeUrlHash(candidate)
    }

    private fun normalizeUrlHash(value: String): String {
        val normalized = value.trim()
        if (!URL_HASH_REGEX.matches(normalized)) {
            throw ApplicationException.badRequest(INVALID_ABUSE_REPORT_CODE, "Invalid short URL or hash")
        }
        return normalized
    }

    private fun applyReportAutoAction(urlHash: String, mapping: UrlMapping) {
        if (mapping.disabled) {
            return
        }

        val reportCount = abuseReportRepository.countByUrlHashAndCreatedAtAfter(
            urlHash,
            Instant.now(clock).minus(moderationProperties.autoActionWindowHours, ChronoUnit.HOURS)
        )

        if (reportCount >= moderationProperties.autoDisableReportThreshold) {
            // Public reports request review; only an authorized moderator disables links.
            auditLogService.record("short_url_report_review_required", "pending", targetId = urlHash)
        }
        if (reportCount >= moderationProperties.autoInterstitialReportThreshold &&
            (!mapping.safetyInterstitialRequired || mapping.safetyInterstitialReason != "abuse_reported")) {
            urlRepository.requireSafetyInterstitial(urlHash)
            urlMappingAccessService.evictUrlMapping(urlHash)
            auditLogService.record("short_url_auto_interstitial_required", "success", mapping.userId, urlHash, mapping.originalUrl)
        }
    }
}
