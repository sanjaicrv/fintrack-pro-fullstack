package com.budgetplanner.service.impl;

import com.budgetplanner.dto.request.CategoryBudgetRequest;
import com.budgetplanner.dto.response.CategoryBudgetResponse;
import com.budgetplanner.entity.CategoryBudget;
import com.budgetplanner.entity.ExpenseCategory;
import com.budgetplanner.entity.User;
import com.budgetplanner.repository.CategoryBudgetRepository;
import com.budgetplanner.repository.ExpenseRepository;
import com.budgetplanner.service.CategoryBudgetService;
import com.budgetplanner.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryBudgetServiceImpl implements CategoryBudgetService {

    private final CategoryBudgetRepository categoryBudgetRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryBudgetResponse> getCategoryBudgets(Integer year, Integer month) {
        Long userId = SecurityUtils.getCurrentUserId();
        LocalDate now = LocalDate.now();
        int targetYear = (year != null && year > 0) ? year : now.getYear();
        int targetMonth = (month != null && month > 0) ? month : now.getMonthValue();

        YearMonth ym = YearMonth.of(targetYear, targetMonth);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<CategoryBudget> budgets = categoryBudgetRepository.findByUserId(userId);
        List<ExpenseRepository.CategorySum> categorySums =
                expenseRepository.sumByCategoryAndDateBetween(userId, start, end);

        Map<ExpenseCategory, BigDecimal> spentMap = new EnumMap<>(ExpenseCategory.class);
        for (ExpenseRepository.CategorySum cs : categorySums) {
            spentMap.put(cs.getCategory(), cs.getTotal());
        }

        List<CategoryBudgetResponse> result = new ArrayList<>();
        for (CategoryBudget b : budgets) {
            BigDecimal spent = spentMap.getOrDefault(b.getCategory(), BigDecimal.ZERO);
            result.add(mapToResponse(b.getCategory(), b.getBudgetAmount(), spent));
        }

        // Sort: Exceeded first, then highest percentage
        result.sort((a, b) -> Double.compare(b.getPercentageUsed(), a.getPercentageUsed()));
        return result;
    }

    @Override
    @Transactional
    public CategoryBudgetResponse setCategoryBudget(CategoryBudgetRequest request, Integer year, Integer month) {
        User user = SecurityUtils.getCurrentUser();
        Long userId = user.getId();
        ExpenseCategory category = request.getCategory();
        BigDecimal amount = request.getBudgetAmount();

        log.info("Setting category budget for user id: {}, category: {}, amount: {}", userId, category, amount);

        CategoryBudget budget = categoryBudgetRepository.findByUserIdAndCategory(userId, category)
                .orElse(CategoryBudget.builder()
                        .user(user)
                        .category(category)
                        .build());

        budget.setBudgetAmount(amount);
        categoryBudgetRepository.save(budget);

        LocalDate now = LocalDate.now();
        int targetYear = (year != null && year > 0) ? year : now.getYear();
        int targetMonth = (month != null && month > 0) ? month : now.getMonthValue();
        YearMonth ym = YearMonth.of(targetYear, targetMonth);

        List<ExpenseRepository.CategorySum> sums =
                expenseRepository.sumByCategoryAndDateBetween(userId, ym.atDay(1), ym.atEndOfMonth());

        BigDecimal spent = sums.stream()
                .filter(cs -> cs.getCategory() == category)
                .map(ExpenseRepository.CategorySum::getTotal)
                .findFirst()
                .orElse(BigDecimal.ZERO);

        return mapToResponse(category, amount, spent);
    }

    @Override
    @Transactional
    public void deleteCategoryBudget(ExpenseCategory category) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("Deleting category budget for user id: {}, category: {}", userId, category);
        categoryBudgetRepository.deleteByUserIdAndCategory(userId, category);
    }

    private CategoryBudgetResponse mapToResponse(ExpenseCategory category, BigDecimal budgetAmount, BigDecimal spentAmount) {
        BigDecimal remaining = budgetAmount.subtract(spentAmount);
        double percentage = budgetAmount.compareTo(BigDecimal.ZERO) > 0
                ? spentAmount.divide(budgetAmount, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        String status = "NORMAL";
        if (spentAmount.compareTo(budgetAmount) > 0) {
            status = "EXCEEDED";
        } else if (percentage >= 80.0) {
            status = "WARNING";
        }

        return CategoryBudgetResponse.builder()
                .category(category)
                .categoryLabel(formatCategoryLabel(category))
                .budgetAmount(budgetAmount)
                .spentAmount(spentAmount)
                .remainingAmount(remaining)
                .percentageUsed(percentage)
                .status(status)
                .build();
    }

    private String formatCategoryLabel(ExpenseCategory category) {
        String[] words = category.name().toLowerCase().split("_");
        StringBuilder sb = new StringBuilder();
        for (String w : words) {
            if (!sb.isEmpty()) sb.append(" ");
            sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1));
        }
        return sb.toString();
    }
}
