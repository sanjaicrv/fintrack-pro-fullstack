package com.budgetplanner.service;

import com.budgetplanner.dto.request.IncomeRequest;
import com.budgetplanner.dto.response.IncomeResponse;
import com.budgetplanner.dto.response.PagedResponse;

import java.util.List;

public interface IncomeService {

    /**
     * Creates a new income record for the authenticated user.
     */
    IncomeResponse createIncome(IncomeRequest request);

    /**
     * Returns all income records for the current user (sorted by date desc).
     */
    List<IncomeResponse> getAllIncomes();

    /**
     * Returns paginated income records for the current user.
     */
    PagedResponse<IncomeResponse> getAllIncomesPaged(int page, int size, String sortBy, String sortDir);

    /**
     * Returns a single income record by ID (must belong to current user).
     */
    IncomeResponse getIncomeById(Long id);

    /**
     * Updates an existing income record by ID (must belong to current user).
     */
    IncomeResponse updateIncome(Long id, IncomeRequest request);

    /**
     * Deletes an income record by ID (must belong to current user).
     */
    void deleteIncome(Long id);
}
