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
import org.springframework.http.HttpHeaders;
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
                      "all goals, and 6-month monthly summaries for the dashboard page. " +
                      "Optional 'year' and 'month' query params allow filtering by specific month or all-time (0,0)."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Dashboard data returned"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @Parameter(description = "Target year (e.g. 2026, or 0 for all-time)", example = "2026")
            @RequestParam(required = false) Integer year,
            @Parameter(description = "Target month (1-12, or 0 for all-time)", example = "9")
            @RequestParam(required = false) Integer month) {
        DashboardResponse dashboard = analyticsService.getDashboard(year, month);
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
            @RequestParam(defaultValue = "6") int months,
            @Parameter(description = "Target year for month-wise view (e.g. 2026)", example = "2026")
            @RequestParam(required = false) Integer year,
            @Parameter(description = "Target month for month-wise view (1-12)", example = "9")
            @RequestParam(required = false) Integer month) {

        if (months < 1 || months > 24) {
            months = 6;
        }
        AnalyticsResponse analytics = analyticsService.getAnalytics(months, year, month);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    // ── GET /api/v1/analytics/export/csv ──────────────────────────────────────
    @Operation(
        summary = "Export financial statement to CSV",
        description = "Downloads a formatted CSV statement of all incomes and expenses for the selected month or all time"
    )
    @GetMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<String> exportStatementCsv(
            @Parameter(description = "Target year (e.g. 2026, or 0 for all-time)", example = "2026")
            @RequestParam(required = false) Integer year,
            @Parameter(description = "Target month (1-12, or 0 for all-time)", example = "9")
            @RequestParam(required = false) Integer month) {

        String csv = analyticsService.exportStatementCsv(year, month);
        String filename = String.format("FinTrack_Statement_%s_%s.csv",
                (year != null && year > 0) ? year : "all",
                (month != null && month > 0) ? month : "time");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(csv);
    }
}
