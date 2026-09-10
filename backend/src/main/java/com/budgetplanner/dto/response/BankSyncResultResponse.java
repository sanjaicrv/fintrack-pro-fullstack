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
public class BankSyncResultResponse {

    private String sourceName;
    private int importedCount;
    private int skippedDuplicatesCount;
    private BigDecimal totalExpensesAdded;
    private BigDecimal totalIncomesAdded;
    private String message;
    private List<ImportedItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportedItem {
        private String date;
        private String description;
        private BigDecimal amount;
        private String type; // "EXPENSE" or "INCOME"
        private String category;
    }
}
