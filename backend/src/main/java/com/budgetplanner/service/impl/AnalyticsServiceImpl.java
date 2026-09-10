package com.budgetplanner.service.impl;

import com.budgetplanner.dto.response.AnalyticsResponse;
import com.budgetplanner.dto.response.DashboardResponse;
import com.budgetplanner.dto.response.ExpenseResponse;
import com.budgetplanner.dto.response.GoalResponse;
import com.budgetplanner.dto.response.IncomeResponse;
import com.budgetplanner.entity.Expense;
import com.budgetplanner.entity.ExpenseCategory;
import com.budgetplanner.entity.Income;
import com.budgetplanner.entity.User;
import com.budgetplanner.mapper.ExpenseMapper;
import com.budgetplanner.mapper.GoalMapper;
import com.budgetplanner.mapper.IncomeMapper;
import com.budgetplanner.repository.ExpenseRepository;
import com.budgetplanner.repository.GoalRepository;
import com.budgetplanner.repository.IncomeRepository;
import com.budgetplanner.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final IncomeMapper incomeMapper;
    private final ExpenseMapper expenseMapper;
    private final GoalMapper goalMapper;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        LocalDate now = LocalDate.now();
        return getDashboard(now.getYear(), now.getMonthValue());
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Integer year, Integer month) {
        Long userId = SecurityUtils.getCurrentUserId();
        LocalDate now = LocalDate.now();

        boolean isAllTime = (year != null && year == 0) || (month != null && month == 0);
        int targetYear = (year != null && year > 0) ? year : now.getYear();
        int targetMonth = (month != null && month > 0) ? month : now.getMonthValue();

        log.debug("Building dashboard for user id: {} (year: {}, month: {}, allTime: {})",
                userId, targetYear, targetMonth, isAllTime);

        BigDecimal allTimeIncome = incomeRepository.sumAmountByUserId(userId);
        BigDecimal allTimeExpense = expenseRepository.sumAmountByUserId(userId);
        BigDecimal allTimeSavings = allTimeIncome.subtract(allTimeExpense);

        BigDecimal totalIncome;
        BigDecimal totalExpense;
        String selectedPeriod;
        List<Income> recentIncomes;
        List<Expense> recentExpenses;

        if (isAllTime) {
            totalIncome = allTimeIncome;
            totalExpense = allTimeExpense;
            selectedPeriod = "All Time";
            recentIncomes = incomeRepository.findTop5ByUserId(userId, PageRequest.of(0, 5));
            recentExpenses = expenseRepository.findTop5ByUserId(userId, PageRequest.of(0, 5));
        } else {
            totalIncome = incomeRepository.sumAmountByUserIdAndYearAndMonth(userId, targetYear, targetMonth);
            totalExpense = expenseRepository.sumAmountByUserIdAndYearAndMonth(userId, targetYear, targetMonth);
            YearMonth ym = YearMonth.of(targetYear, targetMonth);
            selectedPeriod = DateUtils.formatMonthYear(ym.atDay(1));

            LocalDate startDate = ym.atDay(1);
            LocalDate endDate = ym.atEndOfMonth();
            List<Income> monthIncomes = incomeRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
            List<Expense> monthExpenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

            // Sort strictly newest first
            monthIncomes.sort((a, b) -> b.getDate().compareTo(a.getDate()));
            monthExpenses.sort((a, b) -> b.getDate().compareTo(a.getDate()));

            recentIncomes = monthIncomes.stream().limit(5).collect(Collectors.toList());
            recentExpenses = monthExpenses.stream().limit(5).collect(Collectors.toList());
        }

        BigDecimal savings = totalIncome.subtract(totalExpense);
        double savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? savings.divide(totalIncome, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        // Month-over-Month Savings Comparison
        BigDecimal previousMonthSavings = BigDecimal.ZERO;
        BigDecimal savingsDelta = BigDecimal.ZERO;
        Double savingsGrowthRate = 0.0;
        String savingsComparisonMessage;

        if (!isAllTime) {
            YearMonth prevYm = YearMonth.of(targetYear, targetMonth).minusMonths(1);
            BigDecimal prevIncome = incomeRepository.sumAmountByUserIdAndYearAndMonth(
                    userId, prevYm.getYear(), prevYm.getMonthValue());
            BigDecimal prevExpense = expenseRepository.sumAmountByUserIdAndYearAndMonth(
                    userId, prevYm.getYear(), prevYm.getMonthValue());
            previousMonthSavings = prevIncome.subtract(prevExpense);
            savingsDelta = savings.subtract(previousMonthSavings);

            if (previousMonthSavings.compareTo(BigDecimal.ZERO) != 0) {
                savingsGrowthRate = savingsDelta.divide(previousMonthSavings.abs(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();
            } else if (savingsDelta.compareTo(BigDecimal.ZERO) > 0) {
                savingsGrowthRate = 100.0;
            }

            if (savingsDelta.compareTo(BigDecimal.ZERO) > 0) {
                savingsComparisonMessage = String.format("You saved ₹%s more than last month (+%.1f%%)",
                        savingsDelta.toPlainString(), Math.abs(savingsGrowthRate));
            } else if (savingsDelta.compareTo(BigDecimal.ZERO) < 0) {
                savingsComparisonMessage = String.format("You saved ₹%s less than last month (%.1f%%)",
                        savingsDelta.abs().toPlainString(), savingsGrowthRate);
            } else {
                savingsComparisonMessage = "Your savings match last month exactly.";
            }
        } else {
            savingsComparisonMessage = "Lifetime cumulative savings.";
        }

        // Monthly Budget & Alert Calculation
        User user = userRepository.findById(userId).orElse(null);
        BigDecimal monthlyBudget = (user != null && user.getMonthlyBudget() != null)
                ? user.getMonthlyBudget()
                : BigDecimal.ZERO;
        BigDecimal budgetSpent = totalExpense;
        BigDecimal budgetRemaining = monthlyBudget.subtract(budgetSpent);
        Double budgetUsedPercentage = 0.0;
        Boolean budgetExceeded = false;
        String budgetAlertLevel = "NOT_SET";

        if (monthlyBudget.compareTo(BigDecimal.ZERO) > 0) {
            budgetUsedPercentage = budgetSpent.divide(monthlyBudget, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
            budgetExceeded = budgetSpent.compareTo(monthlyBudget) > 0;
            if (budgetExceeded) {
                budgetAlertLevel = "EXCEEDED";
            } else if (budgetUsedPercentage >= 80.0) {
                budgetAlertLevel = "WARNING";
            } else {
                budgetAlertLevel = "NORMAL";
            }
        }

        // Daily Safe-To-Spend Allowance Calculation
        LocalDate today = LocalDate.now();
        int daysInMonth = YearMonth.of(targetYear, targetMonth).lengthOfMonth();
        int daysRemainingInMonth = Math.max(1, daysInMonth - today.getDayOfMonth() + 1);
        BigDecimal dailySafeToSpend = BigDecimal.ZERO;

        if (monthlyBudget.compareTo(BigDecimal.ZERO) > 0 && budgetRemaining.compareTo(BigDecimal.ZERO) > 0) {
            dailySafeToSpend = budgetRemaining.divide(BigDecimal.valueOf(daysRemainingInMonth), 2, RoundingMode.HALF_UP);
        }

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
                .allTimeIncome(allTimeIncome)
                .allTimeExpense(allTimeExpense)
                .allTimeSavings(allTimeSavings)
                .selectedYear(isAllTime ? 0 : targetYear)
                .selectedMonth(isAllTime ? 0 : targetMonth)
                .selectedPeriod(selectedPeriod)
                .previousMonthSavings(previousMonthSavings)
                .savingsDelta(savingsDelta)
                .savingsGrowthRate(savingsGrowthRate)
                .savingsComparisonMessage(savingsComparisonMessage)
                .monthlyBudget(monthlyBudget)
                .budgetSpent(budgetSpent)
                .budgetRemaining(budgetRemaining)
                .budgetUsedPercentage(budgetUsedPercentage)
                .budgetExceeded(budgetExceeded)
                .budgetAlertLevel(budgetAlertLevel)
                .dailySafeToSpend(dailySafeToSpend)
                .daysRemainingInMonth(daysRemainingInMonth)
                .daysInMonth(daysInMonth)
                .recentIncomes(incomeResponses)
                .recentExpenses(expenseResponses)
                .goals(goalResponses)
                .monthlySummaries(monthlySummaries)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(int months) {
        return getAnalytics(months, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(int months, Integer year, Integer month) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean isMonthWise = (year != null && month != null && year > 0 && month > 0);
        log.debug("Building analytics for user id: {} (months: {}, year: {}, month: {})",
                userId, months, year, month);

        LocalDate startDate;
        LocalDate endDate;
        BigDecimal totalIncome;
        BigDecimal totalExpense;

        List<AnalyticsResponse.MonthlyData> incomeVsExpense;
        List<AnalyticsResponse.CategoryBreakdown> categoryBreakdown;
        List<AnalyticsResponse.SavingsProgress> savingsProgress;

        if (isMonthWise) {
            YearMonth ym = YearMonth.of(year, month);
            startDate = ym.atDay(1);
            endDate = ym.atEndOfMonth();

            totalIncome = incomeRepository.sumAmountByUserIdAndYearAndMonth(userId, year, month);
            totalExpense = expenseRepository.sumAmountByUserIdAndYearAndMonth(userId, year, month);

            categoryBreakdown = buildCategoryBreakdown(userId, startDate, endDate);
            incomeVsExpense = buildIncomeVsExpenseDataEndingAt(userId, ym, Math.min(months, 12));
            savingsProgress = buildSavingsProgressEndingAt(userId, ym, Math.min(months, 12));
        } else {
            endDate = LocalDate.now();
            startDate = DateUtils.monthsAgo(months - 1);

            incomeVsExpense = buildIncomeVsExpenseData(userId, months);
            categoryBreakdown = buildCategoryBreakdown(userId, startDate, endDate);
            savingsProgress = buildSavingsProgress(userId, months);

            totalIncome = incomeVsExpense.stream()
                    .map(AnalyticsResponse.MonthlyData::getIncome)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totalExpense = incomeVsExpense.stream()
                    .map(AnalyticsResponse.MonthlyData::getExpense)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal totalSavings = totalIncome.subtract(totalExpense);
        double savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? totalSavings.divide(totalIncome, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        int divisor = isMonthWise ? 1 : Math.max(1, months);
        BigDecimal avgMonthlyIncome = totalIncome.divide(BigDecimal.valueOf(divisor), 2, RoundingMode.HALF_UP);
        BigDecimal avgMonthlyExpense = totalExpense.divide(BigDecimal.valueOf(divisor), 2, RoundingMode.HALF_UP);

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

    @Override
    @Transactional(readOnly = true)
    public String exportStatementCsv(Integer year, Integer month) {
        Long userId = SecurityUtils.getCurrentUserId();
        LocalDate now = LocalDate.now();
        int targetYear = (year != null && year > 0) ? year : now.getYear();
        int targetMonth = (month != null && month > 0) ? month : now.getMonthValue();
        boolean isAllTime = (year != null && year == 0) || (month != null && month == 0);

        List<Income> incomes;
        List<Expense> expenses;

        if (isAllTime) {
            incomes = incomeRepository.findByUserId(userId);
            expenses = expenseRepository.findByUserId(userId);
        } else {
            YearMonth ym = YearMonth.of(targetYear, targetMonth);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();
            incomes = incomeRepository.findByUserIdAndDateBetween(userId, start, end);
            expenses = expenseRepository.findByUserIdAndDateBetween(userId, start, end);
        }

        BigDecimal totalIncome = incomes.stream().map(Income::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpense = expenses.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal netSavings = totalIncome.subtract(totalExpense);

        String periodLabel = isAllTime ? "All Time" : String.format("%d-%02d", targetYear, targetMonth);

        record TxItem(LocalDate date, String type, String category, String description, BigDecimal amount) {}
        List<TxItem> items = new ArrayList<>();

        for (Income i : incomes) {
            items.add(new TxItem(
                    i.getDate(),
                    "INCOME",
                    i.isRecurring() ? "Recurring Stream" : "Inflow",
                    i.getSource() != null ? i.getSource() : "Direct Income",
                    i.getAmount()
            ));
        }

        for (Expense e : expenses) {
            String desc = (e.getDescription() != null && !e.getDescription().trim().isEmpty())
                    ? e.getDescription().trim()
                    : (e.getCategory() != null ? e.getCategory().name() : "Bank Debit");
            items.add(new TxItem(
                    e.getDate(),
                    "EXPENSE",
                    e.getCategory() != null ? e.getCategory().name() : "OTHER",
                    desc,
                    e.getAmount()
            ));
        }

        items.sort((a, b) -> b.date().compareTo(a.date()));

        StringBuilder sb = new StringBuilder();
        sb.append("# FINTRACK PRO OFFICIAL FINANCIAL STATEMENT\n");
        sb.append(String.format("# Statement Period: %s\n", periodLabel));
        sb.append(String.format("# Total Inflow: %s INR\n", totalIncome));
        sb.append(String.format("# Total Outflow: %s INR\n", totalExpense));
        sb.append(String.format("# Net Savings: %s INR\n", netSavings));
        sb.append(String.format("# Total Transactions: %d\n", items.size()));
        sb.append("#\n");
        sb.append("Date,Type,Category,Description,Amount (INR)\n");

        for (TxItem item : items) {
            sb.append(String.format("%s,%s,\"%s\",\"%s\",%s%s\n",
                    item.date(),
                    item.type(),
                    item.category().replace("\"", "\"\""),
                    item.description().replace("\"", "\"\""),
                    "INCOME".equals(item.type()) ? "+" : "-",
                    item.amount()
            ));
        }

        return sb.toString();
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

    private List<AnalyticsResponse.MonthlyData> buildIncomeVsExpenseDataEndingAt(Long userId, YearMonth endYm, int months) {
        List<AnalyticsResponse.MonthlyData> data = new ArrayList<>();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = endYm.minusMonths(i);
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

    private List<AnalyticsResponse.SavingsProgress> buildSavingsProgressEndingAt(Long userId, YearMonth endYm, int months) {
        List<AnalyticsResponse.SavingsProgress> progress = new ArrayList<>();
        BigDecimal cumulative = BigDecimal.ZERO;

        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = endYm.minusMonths(i);
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
