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
     * Returns full analytics data for the authenticated user:
     * income vs expense chart, category breakdown, savings progress.
     *
     * @param months number of months to look back (default 6)
     */
    AnalyticsResponse getAnalytics(int months);
}
