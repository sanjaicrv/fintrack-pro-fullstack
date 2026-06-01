package com.budgetplanner.dto.response;

import com.budgetplanner.entity.ExpenseCategory;
import com.budgetplanner.entity.Frequency;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExpenseResponse {

    private Long id;
    private ExpenseCategory category;
    private String description;
    private BigDecimal amount;
    private LocalDate date;
    private boolean recurring;
    private Frequency frequency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
