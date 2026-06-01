package com.budgetplanner.controller;

import com.budgetplanner.constants.AppConstants;
import com.budgetplanner.dto.request.ExpenseRequest;
import com.budgetplanner.dto.response.ExpenseResponse;
import com.budgetplanner.dto.response.PagedResponse;
import com.budgetplanner.response.ApiResponse;
import com.budgetplanner.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AppConstants.EXPENSE_BASE)
@RequiredArgsConstructor
@Tag(name = "Expenses", description = "Manage expense records")
@SecurityRequirement(name = "bearerAuth")
public class ExpenseController {

    private final ExpenseService expenseService;

    // ── POST /api/v1/expenses ────────────────────────────────────────────────
    @Operation(summary = "Create expense", description = "Creates a new expense record for the authenticated user")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Expense created"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(
            @Valid @RequestBody ExpenseRequest request) {

        ExpenseResponse expense = expenseService.createExpense(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.EXPENSE_CREATED, expense));
    }

    // ── GET /api/v1/expenses ─────────────────────────────────────────────────
    @Operation(summary = "Get all expenses", description = "Returns all expense records for the authenticated user (newest first)")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Expenses fetched"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getAllExpenses() {
        List<ExpenseResponse> expenses = expenseService.getAllExpenses();
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    // ── GET /api/v1/expenses/paged ───────────────────────────────────────────
    @Operation(summary = "Get expenses (paginated)", description = "Returns paginated expense records")
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<PagedResponse<ExpenseResponse>>> getAllExpensesPaged(
            @Parameter(description = "Zero-based page index") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")             @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field")            @RequestParam(defaultValue = "date") String sortBy,
            @Parameter(description = "Sort direction: asc or desc") @RequestParam(defaultValue = "desc") String sortDir) {

        PagedResponse<ExpenseResponse> response =
                expenseService.getAllExpensesPaged(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET /api/v1/expenses/{id} ────────────────────────────────────────────
    @Operation(summary = "Get expense by ID", description = "Returns a single expense record belonging to the authenticated user")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Expense found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Expense not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpenseById(
            @Parameter(description = "Expense ID") @PathVariable Long id) {

        ExpenseResponse expense = expenseService.getExpenseById(id);
        return ResponseEntity.ok(ApiResponse.success(expense));
    }

    // ── PUT /api/v1/expenses/{id} ────────────────────────────────────────────
    @Operation(summary = "Update expense", description = "Fully updates an existing expense record")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Expense updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Expense not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(
            @Parameter(description = "Expense ID") @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {

        ExpenseResponse updated = expenseService.updateExpense(id, request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.EXPENSE_UPDATED, updated));
    }

    // ── DELETE /api/v1/expenses/{id} ─────────────────────────────────────────
    @Operation(summary = "Delete expense", description = "Deletes an expense record belonging to the authenticated user")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Expense deleted"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Expense not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @Parameter(description = "Expense ID") @PathVariable Long id) {

        expenseService.deleteExpense(id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.EXPENSE_DELETED));
    }
}
