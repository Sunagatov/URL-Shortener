package com.zufar.urlshortener.analytics.service

import com.zufar.urlshortener.analytics.config.AnalyticsTrackingConfig
import com.zufar.urlshortener.analytics.config.AnalyticsTrackingProperties
import com.zufar.urlshortener.urls.service.*
import io.micrometer.core.instrument.simple.SimpleMeterRegistry
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.core.task.TaskExecutor
import java.time.Instant
import java.util.concurrent.CountDownLatch
import java.util.concurrent.RejectedExecutionException
import java.util.concurrent.TimeUnit
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TrackUrlVisitServiceTest {
    private val command = UrlVisitTrackingCommand("abc12345", null, Instant.now(), "203.0.113.4", null, null,
        UrlVisitSourceType.REDIRECT, UrlVisitEventType.LINK_CLICK)
    private val writer: UrlVisitEventWriter = mock()
    private val metrics = SimpleMeterRegistry()

    @Test
    fun `tracking budget is consumed before tasks are enqueued`() {
        val tasks = mutableListOf<Runnable>()
        val service = TrackUrlVisitService(writer, TaskExecutor { tasks.add(it) },
            AnalyticsTrackingProperties(eventsPerMinute = 2), metrics)
        repeat(10) { service.track(command) }
        assertEquals(2, tasks.size)
        verifyNoInteractions(writer)
        tasks.forEach(Runnable::run)
        verify(writer, times(2)).enrichAndPersist(command)
        assertEquals(8.0, metrics.get("analytics.tracking.dropped").counter().count())
    }

    @Test
    fun `rejection and database failure never escape into redirects`() {
        val rejecting = TrackUrlVisitService(writer, TaskExecutor { throw RejectedExecutionException() },
            AnalyticsTrackingProperties(), metrics)
        rejecting.track(command)
        verifyNoInteractions(writer)

        doThrow(IllegalStateException("database unavailable")).whenever(writer).enrichAndPersist(command)
        TrackUrlVisitService(writer, TaskExecutor(Runnable::run), AnalyticsTrackingProperties(), metrics).track(command)
    }

    @Test
    fun `full worker queue rejects without running analytics on caller`() {
        val executor = AnalyticsTrackingConfig().analyticsExecutor(AnalyticsTrackingProperties(workers = 1, queueCapacity = 1))
        executor.initialize()
        val started = CountDownLatch(1)
        val release = CountDownLatch(1)
        doAnswer { started.countDown(); release.await(5, TimeUnit.SECONDS); null }
            .whenever(writer).enrichAndPersist(any())
        val service = TrackUrlVisitService(writer, executor, AnalyticsTrackingProperties(), metrics)
        try {
            service.track(command)
            assertTrue(started.await(5, TimeUnit.SECONDS))
            service.track(command)
            service.track(command)
            assertEquals(1.0, metrics.get("analytics.tracking.dropped").counter().count())
        } finally {
            release.countDown()
            executor.shutdown()
        }
    }
}
