package com.budgetplanner.controller;

import com.budgetplanner.constants.AppConstants;
import com.budgetplanner.dto.request.GoalContributeRequest;
import com.budgetplanner.dto.request.GoalRequest;
import com.budgetplanner.dto.response.GoalResponse;
import com.budgetplanner.dto.response.PagedResponse;
import com.budgetplanner.response.ApiResponse;
import com.budgetplanner.service.GoalService;
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
@RequestMapping(AppConstants.GOAL_BASE)
@RequiredArgsConstructor
@Tag(name = "Goals", description = "Manage savings goals")
@SecurityRequirement(name = "bearerAuth")
public class GoalController {

    private final GoalService goalService;

    // ── POST /api/v1/goals ───────────────────────────────────────────────────
    @Operation(summary = "Create goal", description = "Creates a new savings goal for the authenticated user")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Goal created"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(
            @Valid @RequestBody GoalRequest request) {

        GoalResponse goal = goalService.createGoal(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(AppConstants.GOAL_CREATED, goal));
    }

    // ── GET /api/v1/goals ────────────────────────────────────────────────────
    @Operation(summary = "Get all goals", description = "Returns all savings goals for the authenticated user (sorted by deadline)")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Goals fetched"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getAllGoals() {
        List<GoalResponse> goals = goalService.getAllGoals();
        return ResponseEntity.ok(ApiResponse.success(goals));
    }

    // ── GET /api/v1/goals/paged ──────────────────────────────────────────────
    @Operation(summary = "Get goals (paginated)", description = "Returns paginated savings goals")
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<PagedResponse<GoalResponse>>> getAllGoalsPaged(
            @Parameter(description = "Zero-based page index") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")             @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field")            @RequestParam(defaultValue = "deadline") String sortBy,
            @Parameter(description = "Sort direction: asc or desc") @RequestParam(defaultValue = "asc") String sortDir) {

        PagedResponse<GoalResponse> response = goalService.getAllGoalsPaged(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── GET /api/v1/goals/{id} ───────────────────────────────────────────────
    @Operation(summary = "Get goal by ID", description = "Returns a single savings goal belonging to the authenticated user")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Goal found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Goal not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> getGoalById(
            @Parameter(description = "Goal ID") @PathVariable Long id) {

        GoalResponse goal = goalService.getGoalById(id);
        return ResponseEntity.ok(ApiResponse.success(goal));
    }

    // ── PUT /api/v1/goals/{id} ───────────────────────────────────────────────
    @Operation(summary = "Update goal", description = "Fully updates an existing savings goal")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Goal updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Goal not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            @Parameter(description = "Goal ID") @PathVariable Long id,
            @Valid @RequestBody GoalRequest request) {

        GoalResponse updated = goalService.updateGoal(id, request);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.GOAL_UPDATED, updated));
    }

    // ── PATCH /api/v1/goals/{id}/contribute ──────────────────────────────────
    @Operation(
        summary = "Contribute to goal",
        description = "Adds an amount to the goal's currentAmount. " +
                      "Used from the GoalsPage 'Add Funds' button in the frontend."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Contribution added"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid amount"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Goal not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PatchMapping("/{id}/contribute")
    public ResponseEntity<ApiResponse<GoalResponse>> contributeToGoal(
            @Parameter(description = "Goal ID") @PathVariable Long id,
            @Valid @RequestBody GoalContributeRequest request) {

        GoalResponse updated = goalService.contributeToGoal(id, request.getAmount());
        return ResponseEntity.ok(ApiResponse.success("Contribution added successfully", updated));
    }

    // ── DELETE /api/v1/goals/{id} ────────────────────────────────────────────
    @Operation(summary = "Delete goal", description = "Deletes a savings goal belonging to the authenticated user")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Goal deleted"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Goal not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @Parameter(description = "Goal ID") @PathVariable Long id) {

        goalService.deleteGoal(id);
        return ResponseEntity.ok(ApiResponse.success(AppConstants.GOAL_DELETED));
    }
}
