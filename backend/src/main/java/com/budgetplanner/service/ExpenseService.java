package com.budgetplanner.service;

import com.budgetplanner.dto.request.ExpenseRequest;
import com.budgetplanner.dto.response.ExpenseResponse;
import com.budgetplanner.dto.response.PagedResponse;

import java.util.List;

public interface ExpenseService {

    /**
     * Creates a new expense record for the authenticated user.
     */
    ExpenseResponse createExpense(ExpenseRequest request);

    /**
     * Returns all expense records for the current user (sorted by date desc).
     */
    List<ExpenseResponse> getAllExpenses();

    /**
     * Returns paginated expense records for the current user.
     */
    PagedResponse<ExpenseResponse> getAllExpensesPaged(int page, int size, String sortBy, String sortDir);

    /**
     * Returns a single expense record by ID (must belong to current user).
     */
    ExpenseResponse getExpenseById(Long id);

    /**
     * Updates an existing expense record by ID (must belong to current user).
     */
    ExpenseResponse updateExpense(Long id, ExpenseRequest request);

    /**
     * Deletes an expense record by ID (must belong to current user).
     */
    void deleteExpense(Long id);
}
