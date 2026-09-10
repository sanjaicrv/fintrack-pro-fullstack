package com.budgetplanner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal savings;
    private Double savingsRate;
    private BigDecimal allTimeIncome;
    private BigDecimal allTimeExpense;
    private BigDecimal allTimeSavings;
    private Integer selectedYear;
    private Integer selectedMonth;
    private String selectedPeriod;

    // Month-over-Month Savings Comparison
    private BigDecimal previousMonthSavings;
    private BigDecimal savingsDelta;
    private Double savingsGrowthRate;
    private String savingsComparisonMessage;

    // Monthly Budget & Alert
    private BigDecimal monthlyBudget;
    private BigDecimal budgetSpent;
    private BigDecimal budgetRemaining;
    private Double budgetUsedPercentage;
    private Boolean budgetExceeded;
    private String budgetAlertLevel; // "NORMAL", "WARNING", "EXCEEDED", "NOT_SET"

    // Daily Safe-To-Spend Allowance
    private BigDecimal dailySafeToSpend;
    private Integer daysRemainingInMonth;
    private Integer daysInMonth;

    private List<IncomeResponse> recentIncomes;
    private List<ExpenseResponse> recentExpenses;
    private List<GoalResponse> goals;
    private List<MonthlySummary> monthlySummaries;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlySummary {
        private String month;
        private BigDecimal totalIncome;
        private BigDecimal totalExpense;
        private BigDecimal savings;
    }
}
