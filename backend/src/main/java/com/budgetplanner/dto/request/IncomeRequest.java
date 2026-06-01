package com.budgetplanner.dto.request;

import com.budgetplanner.entity.Frequency;
import com.budgetplanner.validation.ValidFrequency;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncomeRequest {

    @NotBlank(message = "Income source is required")
    @Size(max = 255, message = "Source must not exceed 255 characters")
    private String source;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 13, fraction = 2, message = "Amount format is invalid")
    private BigDecimal amount;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Recurring flag is required")
    private Boolean recurring;

    @ValidFrequency
    private Frequency frequency;
}
