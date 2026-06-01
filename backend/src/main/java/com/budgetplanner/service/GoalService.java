package com.budgetplanner.service;

import com.budgetplanner.dto.request.GoalRequest;
import com.budgetplanner.dto.response.GoalResponse;
import com.budgetplanner.dto.response.PagedResponse;

import java.math.BigDecimal;
import java.util.List;

public interface GoalService {

    /**
     * Creates a new savings goal for the authenticated user.
     */
    GoalResponse createGoal(GoalRequest request);

    /**
     * Returns all goals for the current user (sorted by deadline asc).
     */
    List<GoalResponse> getAllGoals();

    /**
     * Returns paginated goals for the current user.
     */
    PagedResponse<GoalResponse> getAllGoalsPaged(int page, int size, String sortBy, String sortDir);

    /**
     * Returns a single goal by ID (must belong to current user).
     */
    GoalResponse getGoalById(Long id);

    /**
     * Updates a goal by ID (must belong to current user).
     */
    GoalResponse updateGoal(Long id, GoalRequest request);

    /**
     * Adds an amount to the goal's currentAmount (contribute to goal).
     */
    GoalResponse contributeToGoal(Long id, BigDecimal amount);

    /**
     * Deletes a goal by ID (must belong to current user).
     */
    void deleteGoal(Long id);
}
