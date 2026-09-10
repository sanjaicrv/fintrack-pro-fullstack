package com.budgetplanner.service;

import com.budgetplanner.dto.request.CategoryBudgetRequest;
import com.budgetplanner.dto.response.CategoryBudgetResponse;
import com.budgetplanner.entity.ExpenseCategory;

import java.util.List;

public interface CategoryBudgetService {

    List<CategoryBudgetResponse> getCategoryBudgets(Integer year, Integer month);

    CategoryBudgetResponse setCategoryBudget(CategoryBudgetRequest request, Integer year, Integer month);

    void deleteCategoryBudget(ExpenseCategory category);
}
