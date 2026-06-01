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
