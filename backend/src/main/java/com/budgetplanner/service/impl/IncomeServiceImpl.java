package com.budgetplanner.service.impl;

import com.budgetplanner.dto.request.IncomeRequest;
import com.budgetplanner.dto.response.IncomeResponse;
import com.budgetplanner.dto.response.PagedResponse;
import com.budgetplanner.entity.Income;
import com.budgetplanner.entity.User;
import com.budgetplanner.exception.BadRequestException;
import com.budgetplanner.exception.ResourceNotFoundException;
import com.budgetplanner.mapper.IncomeMapper;
import com.budgetplanner.repository.IncomeRepository;
import com.budgetplanner.service.IncomeService;
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
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;
    private final IncomeMapper incomeMapper;

    @Override
    @Transactional
    public IncomeResponse createIncome(IncomeRequest request) {
        validateFrequency(request);
        User currentUser = SecurityUtils.getCurrentUser();
        log.info("Creating income for user id: {}", currentUser.getId());

        Income income = incomeMapper.toEntity(request);
        income.setUser(currentUser);

        income = incomeRepository.save(income);
        log.info("Income created with id: {}", income.getId());
        return incomeMapper.toResponse(income);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncomeResponse> getAllIncomes() {
        Long userId = SecurityUtils.getCurrentUserId();
        log.debug("Fetching all incomes for user id: {}", userId);

        Pageable sortedByDateDesc = PageRequest.of(0, Integer.MAX_VALUE,
                Sort.by(Sort.Direction.DESC, "date"));
        // Return all, sorted
        List<Income> incomes = incomeRepository.findByUserId(userId);
        incomes.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        return incomeMapper.toResponseList(incomes);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<IncomeResponse> getAllIncomesPaged(int page, int size, String sortBy, String sortDir) {
        Long userId = SecurityUtils.getCurrentUserId();

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Income> incomePage = incomeRepository.findByUserId(userId, pageable);

        return PagedResponse.<IncomeResponse>builder()
                .content(incomeMapper.toResponseList(incomePage.getContent()))
                .page(incomePage.getNumber())
                .size(incomePage.getSize())
                .totalElements(incomePage.getTotalElements())
                .totalPages(incomePage.getTotalPages())
                .last(incomePage.isLast())
                .first(incomePage.isFirst())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public IncomeResponse getIncomeById(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Income income = findIncomeByIdAndUser(id, userId);
        return incomeMapper.toResponse(income);
    }

    @Override
    @Transactional
    public IncomeResponse updateIncome(Long id, IncomeRequest request) {
        validateFrequency(request);
        Long userId = SecurityUtils.getCurrentUserId();
        Income income = findIncomeByIdAndUser(id, userId);

        log.info("Updating income id: {} for user id: {}", id, userId);
        incomeMapper.updateEntityFromRequest(request, income);
        income = incomeRepository.save(income);
        return incomeMapper.toResponse(income);
    }

    @Override
    @Transactional
    public void deleteIncome(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Income income = findIncomeByIdAndUser(id, userId);
        log.info("Deleting income id: {} for user id: {}", id, userId);
        incomeRepository.delete(income);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private Income findIncomeByIdAndUser(Long id, Long userId) {
        return incomeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Income", "id", id));
    }

    private void validateFrequency(IncomeRequest request) {
        if (Boolean.TRUE.equals(request.getRecurring()) && request.getFrequency() == null) {
            throw new BadRequestException("Frequency is required when recurring is true");
        }
        if (Boolean.FALSE.equals(request.getRecurring())) {
            request.setFrequency(null); // Clear frequency if not recurring
        }
    }
}
