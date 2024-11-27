package com.zufar.urlshortener.statistics.controller

import com.zufar.urlshortener.common.exception.ErrorResponse
import com.zufar.urlshortener.statistics.dto.UserStatisticsDto
import com.zufar.urlshortener.statistics.service.StatisticsProvider
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1")
@Tag(
    name = "Statistics Management",
    description = "Operations for retrieving statistics related to user's shortened URLs."
)
class StatisticsProviderController(
    private val statisticsProvider: StatisticsProvider
) {

    @Operation(
        summary = "Get User Statistics",
        description = "Retrieve overall statistics for the authenticated user, including total counts and per-URL statistics."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved user statistics.",
        content = [Content(
            mediaType = "application/json",
            schema = Schema(implementation = UserStatisticsDto::class)
        )]
    )
    @ApiResponse(
        responseCode = "401",
        description = "Unauthorized access.",
        content = [Content(
            mediaType = "application/json",
            schema = Schema(implementation = ErrorResponse::class)
        )]
    )
    @GetMapping("/statistics")
    fun getUserStatistics(): ResponseEntity<UserStatisticsDto> {
        val userStatistics = statisticsProvider.get()
        return ResponseEntity.ok(userStatistics)
    }
}
