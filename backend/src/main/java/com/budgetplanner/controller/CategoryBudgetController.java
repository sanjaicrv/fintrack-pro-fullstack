package com.budgetplanner.controller;

import com.budgetplanner.constants.AppConstants;
import com.budgetplanner.dto.request.CategoryBudgetRequest;
import com.budgetplanner.dto.response.CategoryBudgetResponse;
import com.budgetplanner.entity.ExpenseCategory;
import com.budgetplanner.response.ApiResponse;
import com.budgetplanner.service.CategoryBudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AppConstants.CATEGORY_BUDGET_BASE)
@RequiredArgsConstructor
@Tag(name = "Category Budgets", description = "Envelope budgeting per expense category")
@SecurityRequirement(name = "bearerAuth")
public class CategoryBudgetController {

    private final CategoryBudgetService categoryBudgetService;

    @Operation(summary = "Get category budgets for a specific month")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryBudgetResponse>>> getCategoryBudgets(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        List<CategoryBudgetResponse> budgets = categoryBudgetService.getCategoryBudgets(year, month);
        return ResponseEntity.ok(ApiResponse.success(budgets));
    }

    @Operation(summary = "Set or update a category budget limit")
    @PutMapping
    public ResponseEntity<ApiResponse<CategoryBudgetResponse>> setCategoryBudget(
            @Valid @RequestBody CategoryBudgetRequest request,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        CategoryBudgetResponse response = categoryBudgetService.setCategoryBudget(request, year, month);
        return ResponseEntity.ok(ApiResponse.success("Category budget updated successfully", response));
    }

    @Operation(summary = "Delete a category budget limit")
    @DeleteMapping("/{category}")
    public ResponseEntity<ApiResponse<Void>> deleteCategoryBudget(
            @PathVariable ExpenseCategory category) {
        categoryBudgetService.deleteCategoryBudget(category);
        return ResponseEntity.ok(ApiResponse.success("Category budget removed successfully"));
    }
}
