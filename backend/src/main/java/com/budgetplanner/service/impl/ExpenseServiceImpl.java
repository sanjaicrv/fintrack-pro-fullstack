package com.budgetplanner.service.impl;

import com.budgetplanner.dto.request.ExpenseRequest;
import com.budgetplanner.dto.response.ExpenseResponse;
import com.budgetplanner.dto.response.PagedResponse;
import com.budgetplanner.entity.Expense;
import com.budgetplanner.entity.User;
import com.budgetplanner.exception.BadRequestException;
import com.budgetplanner.exception.ResourceNotFoundException;
import com.budgetplanner.mapper.ExpenseMapper;
import com.budgetplanner.repository.ExpenseRepository;
import com.budgetplanner.service.ExpenseService;
import com.budgetplanner.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseMapper expenseMapper;

    @Override
    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request) {
        validateFrequency(request);
        User currentUser = SecurityUtils.getCurrentUser();
        log.info("Creating expense for user id: {}", currentUser.getId());

        Expense expense = expenseMapper.toEntity(request);
        expense.setUser(currentUser);

        expense = expenseRepository.save(expense);
        log.info("Expense created with id: {}", expense.getId());
        return expenseMapper.toResponse(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses() {
        Long userId = SecurityUtils.getCurrentUserId();
        log.debug("Fetching all expenses for user id: {}", userId);

        List<Expense> expenses = expenseRepository.findByUserId(userId);
        expenses.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        return expenseMapper.toResponseList(expenses);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ExpenseResponse> getAllExpensesPaged(int page, int size, String sortBy, String sortDir) {
        Long userId = SecurityUtils.getCurrentUserId();

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Expense> expensePage = expenseRepository.findByUserId(userId, pageable);

        return PagedResponse.<ExpenseResponse>builder()
                .content(expenseMapper.toResponseList(expensePage.getContent()))
                .page(expensePage.getNumber())
                .size(expensePage.getSize())
                .totalElements(expensePage.getTotalElements())
                .totalPages(expensePage.getTotalPages())
                .last(expensePage.isLast())
                .first(expensePage.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Expense expense = findExpenseByIdAndUser(id, userId);
        return expenseMapper.toResponse(expense);
    }

    @Override
    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        validateFrequency(request);
        Long userId = SecurityUtils.getCurrentUserId();
        Expense expense = findExpenseByIdAndUser(id, userId);

        log.info("Updating expense id: {} for user id: {}", id, userId);
        expenseMapper.updateEntityFromRequest(request, expense);
        expense = expenseRepository.save(expense);
        return expenseMapper.toResponse(expense);
    }

    @Override
    @Transactional
    public void deleteExpense(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Expense expense = findExpenseByIdAndUser(id, userId);
        log.info("Deleting expense id: {} for user id: {}", id, userId);
        expenseRepository.delete(expense);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private Expense findExpenseByIdAndUser(Long id, Long userId) {
        return expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Expense", "id", id));
    }

    private void validateFrequency(ExpenseRequest request) {
        if (Boolean.TRUE.equals(request.getRecurring()) && request.getFrequency() == null) {
            throw new BadRequestException("Frequency is required when recurring is true");
        }
        if (Boolean.FALSE.equals(request.getRecurring())) {
            request.setFrequency(null);
        }
    }
}
