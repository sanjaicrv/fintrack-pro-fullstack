package com.budgetplanner.controller;

import com.budgetplanner.constants.AppConstants;
import com.budgetplanner.dto.request.IncomeRequest;
import com.budgetplanner.dto.response.IncomeResponse;
import com.budgetplanner.dto.response.PagedResponse;
import com.budgetplanner.response.ApiResponse;
import com.budgetplanner.service.IncomeService;
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
@RequestMapping(AppConstants.INCOME_BASE)
@RequiredArgsConstructor
@Tag(name = "Income", description = "Manage income records")
@SecurityRequirement(name = "bearerAuth")
public class IncomeController {

    private final IncomeService incomeService;

    // ── POST /api/v1/incomes ─────────────────────────────────────────────────
    @Operation(summary = "Create income", description = "Creates a new income record for the authenticated user")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Income created"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<IncomeResponse>> createIncome(
            @Valid @RequestBody IncomeRequest request) {

        IncomeResponse income = incomeService.createIncome(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.INCOME_CREATED, income));
    }

    // ── GET /api/v1/incomes ──────────────────────────────────────────────────
    @Operation(summary = "Get all incomes", description = "Returns all income records for the authenticated user (newest first)")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Incomes fetched"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<IncomeResponse>>> getAllIncomes() {
        List<IncomeResponse> incomes = incomeService.getAllIncomes();
        return ResponseEntity.ok(ApiResponse.success(incomes));
    }

    // ── GET /api/v1/incomes/paged ────────────────────────────────────────────
    @Operation(summary = "Get incomes (paginated)", description = "Returns paginated income records")
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<PagedResponse<IncomeResponse>>> getAllIncomesPaged(
            @Parameter(description = "Zero-based page index") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")             @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field")            @RequestParam(defaultValue = "date") String sortBy,
            @Parameter(description = "Sort direction: asc or desc") @RequestParam(defaultValue = "desc") String sortDir) {

        PagedResponse<IncomeResponse> response = incomeService.getAllIncomesPaged(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET /api/v1/incomes/{id} ─────────────────────────────────────────────
    @Operation(summary = "Get income by ID", description = "Returns a single income record belonging to the authenticated user")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Income found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Income not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponse>> getIncomeById(
            @Parameter(description = "Income ID") @PathVariable Long id) {

        IncomeResponse income = incomeService.getIncomeById(id);
        return ResponseEntity.ok(ApiResponse.success(income));
    }

    // ── PUT /api/v1/incomes/{id} ─────────────────────────────────────────────
    @Operation(summary = "Update income", description = "Fully updates an existing income record")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Income updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Income not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponse>> updateIncome(
            @Parameter(description = "Income ID") @PathVariable Long id,
            @Valid @RequestBody IncomeRequest request) {

        IncomeResponse updated = incomeService.updateIncome(id, request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.INCOME_UPDATED, updated));
    }

    // ── DELETE /api/v1/incomes/{id} ──────────────────────────────────────────
    @Operation(summary = "Delete income", description = "Deletes an income record belonging to the authenticated user")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Income deleted"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Income not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIncome(
            @Parameter(description = "Income ID") @PathVariable Long id) {

        incomeService.deleteIncome(id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.INCOME_DELETED));
    }
}
