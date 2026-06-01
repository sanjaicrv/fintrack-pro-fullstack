package com.budgetplanner.dto.response;

import com.budgetplanner.entity.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    // Income vs Expense chart data (monthly)
    private List<MonthlyData> incomeVsExpense;

    // Expense category breakdown (pie chart)
    private List<CategoryBreakdown> expenseByCategory;

    // Savings progress over time
    private List<SavingsProgress> savingsProgress;

    // Summary stats
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal totalSavings;
    private Double savingsRate;
    private BigDecimal averageMonthlyIncome;
    private BigDecimal averageMonthlyExpense;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private String month;   // e.g. "Jan 2024"
        private BigDecimal income;
        private BigDecimal expense;
        private BigDecimal savings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private ExpenseCategory category;
        private String categoryLabel;
        private BigDecimal amount;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SavingsProgress {
        private String month;
        private BigDecimal cumulativeSavings;
        private BigDecimal monthlySavings;
    }
}
