package com.budgetplanner.dto.response;

import com.budgetplanner.entity.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBudgetResponse {

    private ExpenseCategory category;
    private String categoryLabel;
    private BigDecimal budgetAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double percentageUsed;
    private String status; // "NORMAL", "WARNING" (>=80%), "EXCEEDED" (>100%)
}
