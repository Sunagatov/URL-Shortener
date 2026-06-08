package com.zufar.urlshortener.moderation.service

import com.zufar.urlshortener.auth.service.user.AuthenticatedUserContextService
import com.zufar.urlshortener.moderation.config.ModerationProperties
import com.zufar.urlshortener.moderation.dto.AbuseReportRequest
import com.zufar.urlshortener.moderation.dto.DisableUrlMappingRequest
import com.zufar.urlshortener.moderation.entity.AbuseReport
import com.zufar.urlshortener.moderation.repository.AbuseReportRepository
import com.zufar.urlshortener.shared.exception.ApplicationException
import com.zufar.urlshortener.shared.http.ClientIpResolver
import com.zufar.urlshortener.shared.security.AuditLogService
import com.zufar.urlshortener.urls.entity.UrlMapping
import com.zufar.urlshortener.urls.repository.UrlRepository
import com.zufar.urlshortener.urls.service.UrlMappingAccessService
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.Optional
import kotlin.test.assertEquals

@ExtendWith(MockitoExtension::class)
class ModerationServiceTest {
    @Mock private lateinit var abuseReportRepository: AbuseReportRepository
    @Mock private lateinit var urlRepository: UrlRepository
    @Mock private lateinit var authenticatedUserContext: AuthenticatedUserContextService
    @Mock private lateinit var clientIpResolver: ClientIpResolver
    @Mock private lateinit var httpRequest: HttpServletRequest
    private val clock: Clock = Clock.fixed(Instant.parse("2024-01-01T10:15:30Z"), ZoneOffset.UTC)

    private fun service(adminUserIds: String = "admin-user") = ModerationService(
        abuseReportRepository = abuseReportRepository,
        urlRepository = urlRepository,
        urlMappingAccessService = UrlMappingAccessService(urlRepository, authenticatedUserContext, clock),
        authenticatedUserContext = authenticatedUserContext,
        clientIpResolver = clientIpResolver,
        moderationProperties = ModerationProperties(adminUserIds),
        auditLogService = AuditLogService(),
        clock = clock
    )

    @Test
    fun `reportAbuse stores report with hashed reporter metadata`() {
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(mapping()))
        whenever(clientIpResolver.resolve(httpRequest)).thenReturn("127.0.0.1")
        whenever(httpRequest.getHeader("User-Agent")).thenReturn("JUnit")
        whenever(abuseReportRepository.save(any<AbuseReport>())).thenAnswer {
            (it.arguments[0] as AbuseReport).copy(id = "report-1")
        }

        val response = service().reportAbuse(
            AbuseReportRequest("https://zuf.uk/abc12345", "phishing"),
            httpRequest
        )

        val captor = argumentCaptor<AbuseReport>()
        verify(abuseReportRepository).save(captor.capture())
        assertEquals("report-1", response.reportId)
        assertEquals("abc12345", response.urlHash)
        assertEquals(64, captor.firstValue.reporterIpHash?.length)
        assertEquals(64, captor.firstValue.reporterUserAgentHash?.length)
    }

    @Test
    fun `disableUrlMapping rejects non-admin user`() {
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("normal-user")

        val ex = assertThrows<ApplicationException> {
            service().disableUrlMapping("abc12345", DisableUrlMappingRequest("phishing"))
        }

        assertEquals("MODERATION_FORBIDDEN", ex.code)
    }

    @Test
    fun `disableUrlMapping marks mapping disabled for configured admin`() {
        whenever(authenticatedUserContext.requireAuthenticatedUserId()).thenReturn("admin-user")
        whenever(urlRepository.findByUrlHash("abc12345")).thenReturn(Optional.of(mapping()))
        whenever(urlRepository.save(any<UrlMapping>())).thenAnswer { it.arguments[0] }

        val result = service().disableUrlMapping("abc12345", DisableUrlMappingRequest("phishing"))

        val captor = argumentCaptor<UrlMapping>()
        verify(urlRepository).save(captor.capture())
        assertEquals(true, result.disabled)
        assertEquals("phishing", captor.firstValue.disabledReason)
        assertEquals(Instant.parse("2024-01-01T10:15:30Z"), captor.firstValue.disabledAt)
    }

    private fun mapping() = UrlMapping(
        urlHash = "abc12345",
        shortUrl = "https://zuf.uk/abc12345",
        originalUrl = "https://example.com",
        clickCount = 0,
        createdAt = Instant.parse("2023-12-31T10:15:30Z"),
        expirationDate = Instant.parse("2024-12-31T10:15:30Z"),
        requestIp = null,
        userAgent = null,
        userId = "user-123"
    )
}
