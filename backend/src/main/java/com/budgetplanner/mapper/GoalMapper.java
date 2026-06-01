package com.budgetplanner.mapper;

import com.budgetplanner.dto.request.GoalRequest;
import com.budgetplanner.dto.response.GoalResponse;
import com.budgetplanner.entity.Goal;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface GoalMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    // @Mapping(target = "createdAt", ignore = true)
    // @Mapping(target = "updatedAt", ignore = true)
    Goal toEntity(GoalRequest request);

    @Mapping(target = "progressPercentage", expression = "java(calculateProgress(goal))")
    @Mapping(target = "daysRemaining", expression = "java(calculateDaysRemaining(goal))")
    @Mapping(target = "status", expression = "java(calculateStatus(goal))")
    GoalResponse toResponse(Goal goal);

    List<GoalResponse> toResponseList(List<Goal> goals);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(GoalRequest request, @MappingTarget Goal goal);

    default Double calculateProgress(Goal goal) {
        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return goal.getCurrentAmount()
                .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    default Long calculateDaysRemaining(Goal goal) {
        return ChronoUnit.DAYS.between(LocalDate.now(), goal.getDeadline());
    }

    default String calculateStatus(Goal goal) {
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) return "COMPLETED";
        if (LocalDate.now().isAfter(goal.getDeadline())) return "OVERDUE";
        long days = ChronoUnit.DAYS.between(LocalDate.now(), goal.getDeadline());
        if (days <= 30) return "URGENT";
        return "IN_PROGRESS";
    }
}
