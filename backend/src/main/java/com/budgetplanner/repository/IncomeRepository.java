package com.budgetplanner.repository;

import com.budgetplanner.entity.Income;
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
public interface IncomeRepository extends JpaRepository<Income, Long> {

    Page<Income> findByUserId(Long userId, Pageable pageable);

    List<Income> findByUserId(Long userId);

    Optional<Income> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.user.id = :userId")
    BigDecimal sumAmountByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i " +
           "WHERE i.user.id = :userId " +
           "AND YEAR(i.date) = :year AND MONTH(i.date) = :month")
    BigDecimal sumAmountByUserIdAndYearAndMonth(
            @Param("userId") Long userId,
            @Param("year") int year,
            @Param("month") int month);

    @Query("SELECT i FROM Income i WHERE i.user.id = :userId " +
           "AND i.date BETWEEN :startDate AND :endDate ORDER BY i.date DESC")
    List<Income> findByUserIdAndDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT i FROM Income i WHERE i.user.id = :userId ORDER BY i.date DESC")
    List<Income> findTop5ByUserId(@Param("userId") Long userId, Pageable pageable);
}
