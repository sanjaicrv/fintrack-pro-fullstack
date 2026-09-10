package com.budgetplanner.repository;

import com.budgetplanner.entity.CategoryBudget;
import com.budgetplanner.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryBudgetRepository extends JpaRepository<CategoryBudget, Long> {

    List<CategoryBudget> findByUserId(Long userId);

    Optional<CategoryBudget> findByUserIdAndCategory(Long userId, ExpenseCategory category);

    void deleteByUserIdAndCategory(Long userId, ExpenseCategory category);
}
