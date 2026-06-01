package com.budgetplanner.dto.request;

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
public class GoalRequest {

    @NotBlank(message = "Goal name is required")
    @Size(max = 255, message = "Goal name must not exceed 255 characters")
    private String name;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "0.01", message = "Target amount must be greater than 0")
    @Digits(integer = 13, fraction = 2, message = "Target amount format is invalid")
    private BigDecimal targetAmount;

    @NotNull(message = "Current amount is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "Current amount cannot be negative")
    @Digits(integer = 13, fraction = 2, message = "Current amount format is invalid")
    private BigDecimal currentAmount;

    @NotNull(message = "Deadline is required")
    @Future(message = "Deadline must be a future date")
    private LocalDate deadline;
}
