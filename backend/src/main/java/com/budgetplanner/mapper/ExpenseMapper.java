package com.budgetplanner.mapper;

import com.budgetplanner.dto.request.ExpenseRequest;
import com.budgetplanner.dto.response.ExpenseResponse;
import com.budgetplanner.entity.Expense;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ExpenseMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    // @Mapping(target = "createdAt", ignore = true)
    // @Mapping(target = "updatedAt", ignore = true)
    Expense toEntity(ExpenseRequest request);

    ExpenseResponse toResponse(Expense expense);

    List<ExpenseResponse> toResponseList(List<Expense> expenses);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(ExpenseRequest request, @MappingTarget Expense expense);
}
