package com.budgetplanner.service.impl;

import com.budgetplanner.dto.response.AnalyticsResponse;
import com.budgetplanner.dto.response.DashboardResponse;
import com.budgetplanner.dto.response.ExpenseResponse;
import com.budgetplanner.dto.response.GoalResponse;
import com.budgetplanner.dto.response.IncomeResponse;
import com.budgetplanner.entity.Expense;
import com.budgetplanner.entity.ExpenseCategory;
import com.budgetplanner.entity.Income;
import com.budgetplanner.mapper.ExpenseMapper;
import com.budgetplanner.mapper.GoalMapper;
import com.budgetplanner.mapper.IncomeMapper;
import com.budgetplanner.repository.ExpenseRepository;
import com.budgetplanner.repository.GoalRepository;
import com.budgetplanner.repository.IncomeRepository;
import com.budgetplanner.service.AnalyticsService;
import com.budgetplanner.util.DateUtils;
import com.budgetplanner.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final GoalRepository goalRepository;
    private final IncomeMapper incomeMapper;
    private final ExpenseMapper expenseMapper;
    private final GoalMapper goalMapper;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        Long userId = SecurityUtils.getCurrentUserId();
        log.debug("Building dashboard for user id: {}", userId);

        BigDecimal totalIncome = incomeRepository.sumAmountByUserId(userId);
        BigDecimal totalExpense = expenseRepository.sumAmountByUserId(userId);
        BigDecimal savings = totalIncome.subtract(totalExpense);

        double savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? savings.divide(totalIncome, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        // Recent: top 5 of each
        List<Income> recentIncomes = incomeRepository.findTop5ByUserId(
                userId, PageRequest.of(0, 5));
        List<Expense> recentExpenses = expenseRepository.findTop5ByUserId(
                userId, PageRequest.of(0, 5));

        List<IncomeResponse> incomeResponses = incomeMapper.toResponseList(recentIncomes);
        List<ExpenseResponse> expenseResponses = expenseMapper.toResponseList(recentExpenses);

        List<GoalResponse> goalResponses = goalMapper.toResponseList(
                goalRepository.findByUserIdOrderByDeadlineAsc(userId));

        // Last 6 months summaries
        List<DashboardResponse.MonthlySummary> monthlySummaries = buildMonthlySummaries(userId, 6);

        return DashboardResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .savings(savings)
                .savingsRate(savingsRate)
                .recentIncomes(incomeResponses)
                .recentExpenses(expenseResponses)
                .goals(goalResponses)
                .monthlySummaries(monthlySummaries)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(int months) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.debug("Building analytics for user id: {} (last {} months)", userId, months);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = DateUtils.monthsAgo(months - 1);

        // Income vs Expense monthly data
        List<AnalyticsResponse.MonthlyData> incomeVsExpense =
                buildIncomeVsExpenseData(userId, months);

        // Category breakdown
        List<AnalyticsResponse.CategoryBreakdown> categoryBreakdown =
                buildCategoryBreakdown(userId, startDate, endDate);

        // Savings progress
        List<AnalyticsResponse.SavingsProgress> savingsProgress =
                buildSavingsProgress(userId, months);

        // Summary totals
        BigDecimal totalIncome = incomeRepository.sumAmountByUserId(userId);
        BigDecimal totalExpense = expenseRepository.sumAmountByUserId(userId);
        BigDecimal totalSavings = totalIncome.subtract(totalExpense);

        double savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? totalSavings.divide(totalIncome, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        BigDecimal avgMonthlyIncome = months > 0
                ? totalIncome.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal avgMonthlyExpense = months > 0
                ? totalExpense.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return AnalyticsResponse.builder()
                .incomeVsExpense(incomeVsExpense)
                .expenseByCategory(categoryBreakdown)
                .savingsProgress(savingsProgress)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .totalSavings(totalSavings)
                .savingsRate(savingsRate)
                .averageMonthlyIncome(avgMonthlyIncome)
                .averageMonthlyExpense(avgMonthlyExpense)
                .build();
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private List<DashboardResponse.MonthlySummary> buildMonthlySummaries(Long userId, int months) {
        List<DashboardResponse.MonthlySummary> summaries = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now.minusMonths(i));
            BigDecimal income = incomeRepository.sumAmountByUserIdAndYearAndMonth(
                    userId, ym.getYear(), ym.getMonthValue());
            BigDecimal expense = expenseRepository.sumAmountByUserIdAndYearAndMonth(
                    userId, ym.getYear(), ym.getMonthValue());

            summaries.add(DashboardResponse.MonthlySummary.builder()
                    .month(DateUtils.formatMonthYear(ym.atDay(1)))
                    .totalIncome(income)
                    .totalExpense(expense)
                    .savings(income.subtract(expense))
                    .build());
        }
        return summaries;
    }

    private List<AnalyticsResponse.MonthlyData> buildIncomeVsExpenseData(Long userId, int months) {
        List<AnalyticsResponse.MonthlyData> data = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now.minusMonths(i));
            BigDecimal income = incomeRepository.sumAmountByUserIdAndYearAndMonth(
                    userId, ym.getYear(), ym.getMonthValue());
            BigDecimal expense = expenseRepository.sumAmountByUserIdAndYearAndMonth(
                    userId, ym.getYear(), ym.getMonthValue());

            data.add(AnalyticsResponse.MonthlyData.builder()
                    .month(DateUtils.formatMonthYear(ym.atDay(1)))
                    .income(income)
                    .expense(expense)
                    .savings(income.subtract(expense))
                    .build());
        }
        return data;
    }

    private List<AnalyticsResponse.CategoryBreakdown> buildCategoryBreakdown(
            Long userId, LocalDate startDate, LocalDate endDate) {

        List<ExpenseRepository.CategorySum> categorySums =
                expenseRepository.sumByCategoryAndDateBetween(userId, startDate, endDate);

        BigDecimal grandTotal = categorySums.stream()
                .map(ExpenseRepository.CategorySum::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return categorySums.stream().map(cs -> {
            double percentage = grandTotal.compareTo(BigDecimal.ZERO) > 0
                    ? cs.getTotal().divide(grandTotal, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;

            return AnalyticsResponse.CategoryBreakdown.builder()
                    .category(cs.getCategory())
                    .categoryLabel(formatCategoryLabel(cs.getCategory()))
                    .amount(cs.getTotal())
                    .percentage(percentage)
                    .build();
        }).collect(Collectors.toList());
    }

    private List<AnalyticsResponse.SavingsProgress> buildSavingsProgress(Long userId, int months) {
        List<AnalyticsResponse.SavingsProgress> progress = new ArrayList<>();
        LocalDate now = LocalDate.now();
        BigDecimal cumulative = BigDecimal.ZERO;

        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now.minusMonths(i));
            BigDecimal income = incomeRepository.sumAmountByUserIdAndYearAndMonth(
                    userId, ym.getYear(), ym.getMonthValue());
            BigDecimal expense = expenseRepository.sumAmountByUserIdAndYearAndMonth(
                    userId, ym.getYear(), ym.getMonthValue());
            BigDecimal monthlySavings = income.subtract(expense);
            cumulative = cumulative.add(monthlySavings);

            progress.add(AnalyticsResponse.SavingsProgress.builder()
                    .month(DateUtils.formatMonthYear(ym.atDay(1)))
                    .monthlySavings(monthlySavings)
                    .cumulativeSavings(cumulative)
                    .build());
        }
        return progress;
    }

    private String formatCategoryLabel(ExpenseCategory category) {
        return category.name().replace("_", " ");
    }
}
