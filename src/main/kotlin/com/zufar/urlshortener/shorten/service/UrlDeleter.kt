package com.zufar.urlshortener.shorten.service

import com.zufar.urlshortener.auth.entity.UserDetails
import com.zufar.urlshortener.shorten.exception.UrlNotFoundException
import com.zufar.urlshortener.shorten.repository.UrlRepository
import com.zufar.urlshortener.statistics.service.updater.DeleteOperationStatisticsUpdater
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class UrlDeleter(
    private val urlRepository: UrlRepository,
    private val userDetailsProvider: UserDetailsProvider,
    private val statisticsUpdater: DeleteOperationStatisticsUpdater
) {
    private val log = LoggerFactory.getLogger(UrlDeleter::class.java)

    fun deleteUrl(urlHash: String) {
        log.info("Attempting to delete URL mapping for urlHash='{}'", urlHash)

        if (!urlRepository.existsById(urlHash)) {
            log.warn("No URL mapping found for urlHash='{}'. Deletion failed.", urlHash)
            throw UrlNotFoundException("No URL mapping found for urlHash='$urlHash'. Deletion failed.")
        }

        log.info("Found URL mapping for urlHash='{}'. Deleting...", urlHash)
        urlRepository.deleteById(urlHash)
        log.info("Deleted URL mapping for urlHash='{}' successfully", urlHash)

        val userDetails: UserDetails = userDetailsProvider.getUserEntity()
        val userId = userDetails.id ?: "anonymous"

        statisticsUpdater.update(userId, urlHash)
        log.info("Statistics was updated for 'DeleteUrl' operation with url={}", urlHash)
    }
}
