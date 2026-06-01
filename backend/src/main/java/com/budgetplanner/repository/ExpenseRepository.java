package com.budgetplanner.repository;

import com.budgetplanner.entity.Expense;
import com.budgetplanner.entity.ExpenseCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    Page<Expense> findByUserId(Long userId, Pageable pageable);

    List<Expense> findByUserId(Long userId);

    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.user.id = :userId")
    BigDecimal sumAmountByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.user.id = :userId " +
           "AND YEAR(e.date) = :year AND MONTH(e.date) = :month")
    BigDecimal sumAmountByUserIdAndYearAndMonth(
            @Param("userId") Long userId,
            @Param("year") int year,
            @Param("month") int month);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId " +
           "AND e.date BETWEEN :startDate AND :endDate ORDER BY e.date DESC")
    List<Expense> findByUserIdAndDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT e.category AS category, COALESCE(SUM(e.amount), 0) AS total " +
           "FROM Expense e WHERE e.user.id = :userId " +
           "GROUP BY e.category")
    List<CategorySum> sumByCategory(@Param("userId") Long userId);

    @Query("SELECT e.category AS category, COALESCE(SUM(e.amount), 0) AS total " +
           "FROM Expense e WHERE e.user.id = :userId " +
           "AND e.date BETWEEN :startDate AND :endDate " +
           "GROUP BY e.category")
    List<CategorySum> sumByCategoryAndDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId ORDER BY e.date DESC")
    List<Expense> findTop5ByUserId(@Param("userId") Long userId, Pageable pageable);

    // Projection interface for category sums
    interface CategorySum {
        ExpenseCategory getCategory();
        BigDecimal getTotal();
    }
}
