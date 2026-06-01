package com.budgetplanner.controller;

import com.budgetplanner.constants.AppConstants;
import com.budgetplanner.dto.response.AnalyticsResponse;
import com.budgetplanner.dto.response.DashboardResponse;
import com.budgetplanner.response.ApiResponse;
import com.budgetplanner.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AppConstants.ANALYTICS_BASE)
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Dashboard summary and chart data endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // ── GET /api/v1/analytics/dashboard ──────────────────────────────────────
    @Operation(
        summary = "Get dashboard data",
        description = "Returns totals, 5 most recent income/expense records, " +
                      "all goals, and 6-month monthly summaries for the dashboard page"
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Dashboard data returned"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse dashboard = analyticsService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    // ── GET /api/v1/analytics ─────────────────────────────────────────────────
    @Operation(
        summary = "Get full analytics",
        description = "Returns income-vs-expense chart data, expense category breakdown (pie), " +
                      "and savings progress data for the Analytics page. " +
                      "Query parameter 'months' controls how far back to look (default 6)."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Analytics data returned"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics(
            @Parameter(description = "Number of months to look back (1-24)", example = "6")
            @RequestParam(defaultValue = "6") int months) {

        if (months < 1 || months > 24) {
            months = 6;
        }
        AnalyticsResponse analytics = analyticsService.getAnalytics(months);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
