package com.budgetplanner.service.impl;

import com.budgetplanner.dto.request.GoalRequest;
import com.budgetplanner.dto.response.GoalResponse;
import com.budgetplanner.dto.response.PagedResponse;
import com.budgetplanner.entity.Goal;
import com.budgetplanner.entity.User;
import com.budgetplanner.exception.BadRequestException;
import com.budgetplanner.exception.ResourceNotFoundException;
import com.budgetplanner.mapper.GoalMapper;
import com.budgetplanner.repository.GoalRepository;
import com.budgetplanner.service.GoalService;
import com.budgetplanner.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final GoalMapper goalMapper;

    @Override
    @Transactional
    public GoalResponse createGoal(GoalRequest request) {
        validateGoalAmounts(request);
        User currentUser = SecurityUtils.getCurrentUser();
        log.info("Creating goal for user id: {}", currentUser.getId());

        Goal goal = goalMapper.toEntity(request);
        goal.setUser(currentUser);

        goal = goalRepository.save(goal);
        log.info("Goal created with id: {}", goal.getId());
        return goalMapper.toResponse(goal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalResponse> getAllGoals() {
        Long userId = SecurityUtils.getCurrentUserId();
        log.debug("Fetching all goals for user id: {}", userId);
        List<Goal> goals = goalRepository.findByUserIdOrderByDeadlineAsc(userId);
        return goalMapper.toResponseList(goals);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<GoalResponse> getAllGoalsPaged(int page, int size, String sortBy, String sortDir) {
        Long userId = SecurityUtils.getCurrentUserId();

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Goal> goalPage = goalRepository.findByUserId(userId, pageable);

        return PagedResponse.<GoalResponse>builder()
                .content(goalMapper.toResponseList(goalPage.getContent()))
                .page(goalPage.getNumber())
                .size(goalPage.getSize())
                .totalElements(goalPage.getTotalElements())
                .totalPages(goalPage.getTotalPages())
                .last(goalPage.isLast())
                .first(goalPage.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public GoalResponse getGoalById(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Goal goal = findGoalByIdAndUser(id, userId);
        return goalMapper.toResponse(goal);
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(Long id, GoalRequest request) {
        validateGoalAmounts(request);
        Long userId = SecurityUtils.getCurrentUserId();
        Goal goal = findGoalByIdAndUser(id, userId);

        log.info("Updating goal id: {} for user id: {}", id, userId);
        goalMapper.updateEntityFromRequest(request, goal);
        goal = goalRepository.save(goal);
        return goalMapper.toResponse(goal);
    }

    @Override
    @Transactional
    public GoalResponse contributeToGoal(Long id, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Contribution amount must be greater than zero");
        }
        Long userId = SecurityUtils.getCurrentUserId();
        Goal goal = findGoalByIdAndUser(id, userId);

        BigDecimal newAmount = goal.getCurrentAmount().add(amount);
        goal.setCurrentAmount(newAmount);

        goal = goalRepository.save(goal);
        log.info("Contributed {} to goal id: {}. New total: {}", amount, id, newAmount);
        return goalMapper.toResponse(goal);
    }

    @Override
    @Transactional
    public void deleteGoal(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Goal goal = findGoalByIdAndUser(id, userId);
        log.info("Deleting goal id: {} for user id: {}", id, userId);
        goalRepository.delete(goal);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private Goal findGoalByIdAndUser(Long id, Long userId) {
        return goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));
    }

    private void validateGoalAmounts(GoalRequest request) {
        if (request.getCurrentAmount() != null && request.getTargetAmount() != null
                && request.getCurrentAmount().compareTo(request.getTargetAmount()) > 0) {
            throw new BadRequestException(
                    "Current amount cannot be greater than target amount");
        }
    }
}
