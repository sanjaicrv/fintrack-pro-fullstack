package com.budgetplanner.service;

import com.budgetplanner.dto.response.AnalyticsResponse;
import com.budgetplanner.dto.response.DashboardResponse;

public interface AnalyticsService {

    /**
     * Returns a full dashboard summary for the authenticated user:
     * totals, recent transactions, goal progress, monthly chart data.
     */
    DashboardResponse getDashboard();

    /**
     * Returns a dashboard summary for a specific year and month,
     * or all-time if year/month are 0.
     */
    DashboardResponse getDashboard(Integer year, Integer month);

    /**
     * Returns full analytics data for the authenticated user:
     * income vs expense chart, category breakdown, savings progress.
     *
     * @param months number of months to look back (default 6)
     */
    AnalyticsResponse getAnalytics(int months);

    /**
     * Returns analytics data for a specific year and month,
     * or for the last N months if year/month are null.
     */
    AnalyticsResponse getAnalytics(int months, Integer year, Integer month);

    /**
     * Generates a downloadable CSV financial statement for a specific month or all time.
     */
    String exportStatementCsv(Integer year, Integer month);
}
