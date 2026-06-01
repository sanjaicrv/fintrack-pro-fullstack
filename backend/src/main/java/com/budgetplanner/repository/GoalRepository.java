package com.budgetplanner.repository;

import com.budgetplanner.entity.Goal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    Page<Goal> findByUserId(Long userId, Pageable pageable);

    List<Goal> findByUserIdOrderByDeadlineAsc(Long userId);

    Optional<Goal> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    @Query("SELECT g FROM Goal g WHERE g.user.id = :userId AND g.deadline >= :today ORDER BY g.deadline ASC")
    List<Goal> findActiveGoalsByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(g) FROM Goal g WHERE g.user.id = :userId AND g.currentAmount >= g.targetAmount")
    long countCompletedGoalsByUserId(@Param("userId") Long userId);
}
